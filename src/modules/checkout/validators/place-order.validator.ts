import { z } from 'zod';
import { paymentMethods } from '@/lib/db/schemas';

const addressSchema = z.object({
  fullName: z.string().min(1).max(255),
  phone: z.string().min(5).max(20),
  addressLine1: z.string().min(1).max(500),
  addressLine2: z.string().max(500).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(2).max(100),
});

export const placeOrderValidator = z.object({
  tenantId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  customerEmail: z.string().email(),
  customerName: z.string().min(1).max(255),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        productId: z.string().uuid(),
        title: z.string().min(1),
        sku: z.string(),
        quantity: z.number().int().min(1).max(1000),
        unitPriceInCents: z.number().int().min(0),
        imageUrl: z.string().url().optional(),
      })
    )
    .min(1, 'Cart must contain at least one item'),
  paymentMethod: z.enum(paymentMethods),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export type ValidatedPlaceOrderInput = z.infer<typeof placeOrderValidator>;
