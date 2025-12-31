using Microsoft.EntityFrameworkCore.Storage;
using FleetManagement.Core.Interfaces;
using FleetManagement.Infrastructure.Data;
using FleetManagement.Infrastructure.Repositories;

namespace FleetManagement.Infrastructure;

public class UnitOfWork : IUnitOfWork
{
    private readonly FleetDbContext _context;
    private IDbContextTransaction? _transaction;
    
    private IBusRepository? _buses;
    private IRouteRepository? _routes;
    private IOperationRepository? _operations;

    public UnitOfWork(FleetDbContext context)
    {
        _context = context;
    }

    public IBusRepository Buses => _buses ??= new BusRepository(_context);
    public IRouteRepository Routes => _routes ??= new RouteRepository(_context);
    public IOperationRepository Operations => _operations ??= new OperationRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            
            if (_transaction != null)
            {
                await _transaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
