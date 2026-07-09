/**
 * Central Schema Export Index
 * All atomic schema files are re-exported here for clean import access.
 * Usage: import { tenants, products, orders } from '@/lib/db/schemas';
 */

export { tenants } from './tenants.schema';
export type { Tenant, NewTenant, ThemeConfig, StoreConfig } from './tenants.schema';

export { users, users as user, userRoles } from './users.schema';
export type { User, NewUser, UserRole } from './users.schema';

export { session, account, verification } from './auth.schema';

export { categories } from './categories.schema';
export type { Category, NewCategory } from './categories.schema';

export { products, productStatuses, productTypes } from './products.schema';
export type { Product, NewProduct, ProductStatus, ProductType } from './products.schema';

export { variants } from './variants.schema';
export type { Variant, NewVariant } from './variants.schema';

export { attributes } from './attributes.schema';
export type { Attribute, NewAttribute } from './attributes.schema';

export { orders, orderStatuses, paymentMethods } from './orders.schema';
export type { Order, NewOrder, OrderStatus, PaymentMethod, ShippingAddress } from './orders.schema';

export { orderItems } from './order-items.schema';
export type { OrderItem, NewOrderItem } from './order-items.schema';

export { transactions, transactionStatuses } from './transactions.schema';
export type { Transaction, NewTransaction, TransactionStatus } from './transactions.schema';

export { storeSettings } from './store-settings.schema';
export type { StoreSettings, NewStoreSettings, ShippingRule, TaxRule } from './store-settings.schema';

export { storefrontTemplates } from './storefront-templates.schema';
export type { StorefrontTemplate, NewStorefrontTemplate, TemplateMetadata } from './storefront-templates.schema';
