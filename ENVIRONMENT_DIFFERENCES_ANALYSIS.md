# Environment Differences Analysis: Lenovo E15 → Mac Mini M4 Pro

## Architecture Changes
- **Lenovo E15**: Intel x64 (amd64)
- **Mac Mini M4 Pro**: ARM64 (arm64)

## Software Versions
| Component | Lenovo E15 | Mac Mini M4 Pro | Status |
|-----------|------------|-----------------|---------|
| Architecture | x64 | ARM64 | ⚠️ Different |
| Node.js | ~18.x | v25.2.1 | ⚠️ Major version jump |
| .NET | 8.0 | 9.0.112 | ✅ Updated in project |
| Docker | x64 images | ARM64 needed | ⚠️ Platform specific |

## Current Issues Identified

### 1. Node.js Version Compatibility
- **Issue**: Node.js v25.2.1 is very new (released Dec 2024)
- **Risk**: Next.js 14.1.0 may not be fully compatible
- **Solution**: Consider downgrading to Node.js 18 LTS or 20 LTS

### 2. Docker Platform Issues
- **Issue**: SQL Server container fails on ARM64
- **Current Fix**: Using `mcr.microsoft.com/azure-sql-edge:latest` with `platform: linux/arm64`
- **Status**: ✅ Fixed

### 3. Frontend-Backend Connection
- **Issue**: Dashboard shows "Failed to load dashboard data"
- **Backend**: ✅ Running on http://localhost:5000 with in-memory DB
- **Frontend**: ✅ Running on http://localhost:3001
- **API**: ✅ Direct curl tests work
- **CORS**: ✅ Configured for localhost:3001

## Testing Results

### Backend API Tests
```bash
# ✅ KPIs endpoint works
curl http://localhost:5000/api/dashboard/kpis
# Returns: {"totalBuses":17,"activeBuses":15,...}

# ✅ Fleet status works  
curl http://localhost:5000/api/dashboard/fleet-status
# Returns: {"timestamp":"2026-01-06T15:32:31.230596Z",...}

# ✅ CORS works
curl -H "Origin: http://localhost:3001" http://localhost:5000/api/dashboard/kpis
# Returns: Data successfully
```

### Frontend Status
- ✅ Next.js compiles successfully
- ✅ Runs on http://localhost:3001
- ⚠️ React Query may have issues
- ⚠️ API client connection unclear

## Next Steps

1. **Test Simple Fetch**: `/simple-test` page to bypass React Query
2. **Test API Client**: `/test-api` page for detailed debugging
3. **Check Browser Console**: Look for JavaScript errors
4. **Node.js Version**: Consider downgrading if compatibility issues
5. **Environment Variables**: Verify all env vars are correct

## Recommended Actions

### Immediate (Testing)
- [ ] Visit http://localhost:3001/simple-test
- [ ] Visit http://localhost:3001/test-api  
- [ ] Check browser console for errors
- [ ] Test main dashboard at http://localhost:3001

### If Issues Persist
- [ ] Downgrade Node.js to v20 LTS using nvm
- [ ] Update Next.js to latest version
- [ ] Check React Query configuration
- [ ] Verify environment variables

### Production Deployment
- [ ] Update Docker images for ARM64 compatibility
- [ ] Test full Docker Compose stack
- [ ] Verify VPS deployment compatibility