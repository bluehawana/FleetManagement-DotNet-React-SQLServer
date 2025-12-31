import { Card } from '../ui/Card';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  subtitle?: string;
}

export function KPICard({ title, value, change, trend, icon, subtitle }: KPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const trendIcon = trend === 'up' ? '↑' : '↓';

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {change !== undefined && (
            <p className={`mt-2 text-sm font-medium ${trendColor}`}>
              {trendIcon} {Math.abs(change)}%
            </p>
          )}
        </div>
        {icon && <div className="text-blue-600 text-3xl">{icon}</div>}
      </div>
    </Card>
  );
}
