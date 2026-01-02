import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface SavingsCardProps {
  problem: string;
  currentCost: number;
  potentialSavings: number;
  actionRequired: string;
  priority: 'high' | 'medium' | 'low';
}

export function SavingsCard({
  problem,
  currentCost,
  potentialSavings,
  actionRequired,
  priority,
}: SavingsCardProps) {
  const priorityStatus = {
    high: 'danger' as const,
    medium: 'warning' as const,
    low: 'info' as const,
  };

  const savingsPercent = ((potentialSavings / currentCost) * 100).toFixed(0);

  return (
    <Card hover className="border-l-4 border-green-500">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{problem}</h3>
        <Badge variant={priorityStatus[priority]}>{priority.toUpperCase()}</Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current Annual Cost:</span>
          <span className="font-medium text-gray-900">${currentCost.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Potential Savings:</span>
          <span className="font-bold text-green-600">${potentialSavings.toLocaleString()}</span>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">Action Required:</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{actionRequired}</p>
        </div>
        
        <div className="mt-3 p-2 bg-green-50 rounded">
          <p className="text-center text-sm font-bold text-green-700">
            Save {savingsPercent}% annually
          </p>
        </div>
      </div>
    </Card>
  );
}
