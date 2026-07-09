import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * OrderStatusBadge — Colored pill based on order status.
 * Maps real order status values to semantic colors.
 */

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  pending: { label: 'Pending', variant: 'outline', className: 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400' },
  payment_verified: { label: 'Payment Verified', variant: 'outline', className: 'border-blue-500/50 text-blue-600 dark:text-blue-400' },
  processing: { label: 'Processing', variant: 'outline', className: 'border-indigo-500/50 text-indigo-600 dark:text-indigo-400' },
  shipped: { label: 'Shipped', variant: 'outline', className: 'border-purple-500/50 text-purple-600 dark:text-purple-400' },
  delivered: { label: 'Delivered', variant: 'outline', className: 'border-green-500/50 text-green-600 dark:text-green-400' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'outline', className: 'border-red-500/50 text-red-600 dark:text-red-400' },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    variant: 'secondary' as const,
  };

  return (
    <Badge variant={config.variant} className={cn('text-xs', config.className)}>
      {config.label}
    </Badge>
  );
}
