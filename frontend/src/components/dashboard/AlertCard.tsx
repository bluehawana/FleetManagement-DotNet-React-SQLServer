import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AlertCardProps {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  cost?: number;
}

export function AlertCard({ severity, title, description, action, onAction, cost }: AlertCardProps) {
  const severityConfig = {
    critical: {
      icon: '🔴',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    warning: {
      icon: '🟡',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    info: {
      icon: '🔵',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  };

  const config = severityConfig[severity];

  return (
    <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
          {cost && (
            <p className="mt-1 text-sm font-medium text-gray-900">
              Cost if delayed: ${cost.toLocaleString()}
            </p>
          )}
          {action && onAction && (
            <Button onClick={onAction} size="sm" className="mt-3">
              {action}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
