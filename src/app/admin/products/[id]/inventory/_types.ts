import type { Database } from '@/types/database';
import type { AdminVariantWithProduct } from '@/lib/admin/queries/inventory';

export type MovementRow = Database['public']['Tables']['inventory_movements']['Row'];
export type VariantWithProduct = AdminVariantWithProduct;
