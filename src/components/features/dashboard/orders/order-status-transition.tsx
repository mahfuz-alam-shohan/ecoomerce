'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';

/**
 * OrderStatusTransition — Real state machine buttons.
 * Only shows valid next states based on the current order status.
 * Calls PUT /api/v1/orders/[orderId] to transition.
 */

const validTransitions: Record<string, { next: string; label: string; className?: string }[]> = {
  pending: [
    { next: 'payment_verified', label: 'Verify Payment' },
    { next: 'cancelled', label: 'Cancel Order', className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
  ],
  payment_verified: [
    { next: 'processing', label: 'Start Processing' },
  ],
  processing: [
    { next: 'shipped', label: 'Mark as Shipped' },
  ],
  shipped: [
    { next: 'delivered', label: 'Mark as Delivered' },
  ],
  delivered: [],
  cancelled: [],
  refunded: [],
};

export function OrderStatusTransition({
  orderId,
  tenantId,
  currentStatus,
}: {
  orderId: string;
  tenantId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const transitions = validTransitions[currentStatus] || [];

  if (transitions.length === 0) {
    return null;
  }

  async function handleTransition(newStatus: string) {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/v1/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, newStatus }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error('Status update failed', { description: data.error });
        setIsLoading(false);
        return;
      }

      toast.success(`Order status updated to "${newStatus.replace(/_/g, ' ')}"`);
      router.refresh();
    } catch (err) {
      toast.error('Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3">
        {transitions.map((t) => (
          <Button
            key={t.next}
            onClick={() => handleTransition(t.next)}
            disabled={isLoading}
            variant={t.className ? 'destructive' : 'default'}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {t.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
