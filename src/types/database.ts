/**
 * Database type, hand-written to mirror the Supabase schema. In production
 * regenerate this with:
 *   supabase gen types typescript --project-id <id> --schema public > src/types/database.ts
 *
 * The shape intentionally exposes every table from migrations 0002–0007 so
 * the typed Supabase client surfaces the right columns at every call site.
 */

export type UserRole = 'customer' | 'staff' | 'admin';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export type DiscountKind = 'percentage' | 'fixed_amount';
export type DiscountAppliesTo = 'order' | 'shipping' | 'product';

export type InventoryMovementReason =
  | 'restock'
  | 'sale'
  | 'return'
  | 'adjustment'
  | 'reservation'
  | 'release';

export type HomepageSectionKind =
  | 'hero'
  | 'category_grid'
  | 'collection_feature'
  | 'editorial'
  | 'product_grid';

interface TableBase {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: Array<{
    foreignKeyName: string;
    columns: string[];
    isOneToOne?: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }>;
}

export type Database = {
  public: {
    Tables: {
      profiles: TableBase & {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          marketing_opt_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          marketing_opt_in?: boolean;
        };
        Update: Partial<{
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          marketing_opt_in: boolean;
        }>;
        Relationships: [];
      };
      user_roles: TableBase & {
        Row: { user_id: string; role: UserRole; created_at: string; updated_at: string };
        Insert: { user_id: string; role?: UserRole };
        Update: { role?: UserRole };
        Relationships: [];
      };
      addresses: TableBase & {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          recipient_name: string;
          phone: string;
          line1: string;
          line2: string | null;
          city: string;
          region: string | null;
          postal_code: string | null;
          country: string;
          is_default_shipping: boolean;
          is_default_billing: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          TableBase['Row'] & {
            label?: string | null;
            recipient_name: string;
            phone: string;
            line1: string;
            line2?: string | null;
            city: string;
            region?: string | null;
            postal_code?: string | null;
            country?: string;
            is_default_shipping?: boolean;
            is_default_billing?: boolean;
          },
          'created_at' | 'updated_at' | 'id'
        >;
        Update: Partial<TableBase['Row']>;
        Relationships: [];
      };
      categories: TableBase & {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: { name: string; slug: string; description?: string | null; parent_id?: string | null; display_order?: number; is_active?: boolean };
        Update: Partial<{ name: string; description: string | null; parent_id: string | null; display_order: number; is_active: boolean }>;
        Relationships: [];
      };
      collections: TableBase & {
        Row: {
          id: string;
          name: string;
          slug: string;
          subtitle: string | null;
          description: string | null;
          hero_image_url: string | null;
          launch_at: string | null;
          end_at: string | null;
          is_active: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: { name: string; slug: string; subtitle?: string | null; description?: string | null; hero_image_url?: string | null; launch_at?: string | null; end_at?: string | null; is_active?: boolean; is_featured?: boolean };
        Update: Partial<{ name: string; subtitle: string | null; description: string | null; hero_image_url: string | null; launch_at: string | null; end_at: string | null; is_active: boolean; is_featured: boolean }>;
        Relationships: [];
      };
      products: TableBase & {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_description: string | null;
          full_description: string | null;
          category_id: string | null;
          price_cents: number;
          compare_at_price_cents: number | null;
          currency: string;
          care_instructions: string | null;
          fit_notes: string | null;
          meta_title: string | null;
          meta_description: string | null;
          is_featured: boolean;
          is_active: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { slug: string; name: string; short_description?: string | null; full_description?: string | null; category_id?: string | null; price_cents: number; compare_at_price_cents?: number | null; currency?: string; care_instructions?: string | null; fit_notes?: string | null; meta_title?: string | null; meta_description?: string | null; is_featured?: boolean; is_active?: boolean; published_at?: string | null };
        Update: Partial<{ name: string; short_description: string | null; full_description: string | null; category_id: string | null; price_cents: number; compare_at_price_cents: number | null; currency: string; care_instructions: string | null; fit_notes: string | null; meta_title: string | null; meta_description: string | null; is_featured: boolean; is_active: boolean; published_at: string | null }>;
        Relationships: [];
      };
      product_images: TableBase & {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string | null;
          display_order: number;
          is_cover: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: { product_id: string; storage_path: string; alt_text?: string | null; display_order?: number; is_cover?: boolean };
        Update: Partial<{ alt_text: string | null; display_order: number; is_cover: boolean }>;
        Relationships: [];
      };
      product_variants: TableBase & {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          size: string | null;
          color: string | null;
          material: string | null;
          metal: string | null;
          gemstone: string | null;
          ring_size: string | null;
          chain_length_cm: number | null;
          stock_quantity: number;
          reserved_quantity: number;
          low_stock_threshold: number;
          price_override_cents: number | null;
          compare_at_price_cents: number | null;
          weight_grams: number | null;
          is_active: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: { product_id: string; sku: string; size?: string | null; color?: string | null; material?: string | null; metal?: string | null; gemstone?: string | null; ring_size?: string | null; chain_length_cm?: number | null; stock_quantity?: number; reserved_quantity?: number; low_stock_threshold?: number; price_override_cents?: number | null; compare_at_price_cents?: number | null; weight_grams?: number | null; is_active?: boolean; position?: number };
        Update: Partial<{ size: string | null; color: string | null; material: string | null; metal: string | null; gemstone: string | null; ring_size: string | null; chain_length_cm: number | null; stock_quantity: number; reserved_quantity: number; low_stock_threshold: number; price_override_cents: number | null; compare_at_price_cents: number | null; weight_grams: number | null; is_active: boolean; position: number }>;
        Relationships: [];
      };
      product_collections: TableBase & {
        Row: { product_id: string; collection_id: string; display_order: number; created_at: string };
        Insert: { product_id: string; collection_id: string; display_order?: number };
        Update: Partial<{ display_order: number }>;
        Relationships: [];
      };
      carts: TableBase & {
        Row: {
          id: string;
          user_id: string;
          delivery_zone_id: string | null;
          note: string | null;
          subtotal_cents: number;
          discount_cents: number;
          shipping_cents: number;
          total_cents: number;
          currency: string;
          last_activity_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: { user_id: string; delivery_zone_id?: string | null; note?: string | null; currency?: string };
        Update: Partial<{ delivery_zone_id: string | null; note: string | null; subtotal_cents: number; discount_cents: number; shipping_cents: number; total_cents: number; last_activity_at: string }>;
        Relationships: [];
      };
      cart_items: TableBase & {
        Row: {
          id: string;
          cart_id: string;
          variant_id: string;
          quantity: number;
          unit_price_cents: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: { cart_id: string; variant_id: string; quantity: number; unit_price_cents: number; currency?: string };
        Update: Partial<{ quantity: number; unit_price_cents: number }>;
        Relationships: [];
      };
      wishlists: TableBase & {
        Row: { id: string; user_id: string; created_at: string; updated_at: string };
        Insert: { user_id: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      wishlist_items: TableBase & {
        Row: { id: string; wishlist_id: string; product_id: string; created_at: string };
        Insert: { wishlist_id: string; product_id: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      delivery_zones: TableBase & {
        Row: { id: string; name: string; country: string; region: string | null; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { name: string; country?: string; region?: string | null; is_active?: boolean; sort_order?: number };
        Update: Partial<{ name: string; country: string; region: string | null; is_active: boolean; sort_order: number }>;
        Relationships: [];
      };
      delivery_rates: TableBase & {
        Row: {
          id: string;
          zone_id: string;
          name: string;
          description: string | null;
          price_cents: number;
          free_threshold_cents: number | null;
          eta_min_days: number | null;
          eta_max_days: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: { zone_id: string; name: string; description?: string | null; price_cents: number; free_threshold_cents?: number | null; eta_min_days?: number | null; eta_max_days?: number | null; is_active?: boolean; sort_order?: number };
        Update: Partial<{ name: string; description: string | null; price_cents: number; free_threshold_cents: number | null; eta_min_days: number | null; eta_max_days: number | null; is_active: boolean; sort_order: number }>;
        Relationships: [];
      };
      discount_codes: TableBase & {
        Row: {
          id: string;
          code: string;
          description: string | null;
          kind: DiscountKind;
          applies_to: DiscountAppliesTo;
          value: number;
          min_subtotal_cents: number | null;
          max_redemptions: number | null;
          redemptions_count: number;
          starts_at: string | null;
          ends_at: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { code: string; description?: string | null; kind: DiscountKind; applies_to?: DiscountAppliesTo; value: number; min_subtotal_cents?: number | null; max_redemptions?: number | null; starts_at?: string | null; ends_at?: string | null; is_active?: boolean; created_by?: string | null };
        Update: Partial<{ description: string | null; value: number; min_subtotal_cents: number | null; max_redemptions: number | null; starts_at: string | null; ends_at: string | null; is_active: boolean }>;
        Relationships: [];
      };
      discount_redemptions: TableBase & {
        Row: { id: string; discount_id: string; user_id: string | null; order_id: string | null; redeemed_at: string };
        Insert: { discount_id: string; user_id?: string | null; order_id?: string | null };
        Update: Record<string, never>;
        Relationships: [];
      };
      orders: TableBase & {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          customer_email: string;
          customer_full_name: string | null;
          customer_phone: string | null;
          shipping_recipient_name: string;
          shipping_phone: string;
          shipping_line1: string;
          shipping_line2: string | null;
          shipping_city: string;
          shipping_region: string | null;
          shipping_postal_code: string | null;
          shipping_country: string;
          billing_recipient_name: string | null;
          billing_phone: string | null;
          billing_line1: string | null;
          billing_line2: string | null;
          billing_city: string | null;
          billing_region: string | null;
          billing_postal_code: string | null;
          billing_country: string | null;
          delivery_zone_id: string | null;
          delivery_rate_id: string | null;
          delivery_zone_name: string | null;
          delivery_rate_name: string | null;
          delivery_price_cents: number;
          currency: string;
          subtotal_cents: number;
          discount_cents: number;
          shipping_cents: number;
          tax_cents: number;
          total_cents: number;
          applied_discount_code: string | null;
          status: OrderStatus;
          placed_at: string;
          paid_at: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          internal_note: string | null;
          customer_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          order_number: string;
          user_id?: string | null;
          customer_email: string;
          customer_full_name?: string | null;
          customer_phone?: string | null;
          shipping_recipient_name: string;
          shipping_phone: string;
          shipping_line1: string;
          shipping_line2?: string | null;
          shipping_city: string;
          shipping_region?: string | null;
          shipping_postal_code?: string | null;
          shipping_country?: string;
          billing_recipient_name?: string | null;
          billing_phone?: string | null;
          billing_line1?: string | null;
          billing_line2?: string | null;
          billing_city?: string | null;
          billing_region?: string | null;
          billing_postal_code?: string | null;
          billing_country?: string | null;
          delivery_zone_id?: string | null;
          delivery_rate_id?: string | null;
          delivery_zone_name?: string | null;
          delivery_rate_name?: string | null;
          delivery_price_cents?: number;
          currency?: string;
          subtotal_cents?: number;
          discount_cents?: number;
          shipping_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          applied_discount_code?: string | null;
          status?: OrderStatus;
          customer_note?: string | null;
        };
        Update: Partial<{
          status: OrderStatus;
          paid_at: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          internal_note: string | null;
        }>;
        Relationships: [];
      };
      order_items: TableBase & {
        Row: {
          id: string;
          order_id: string;
          variant_id: string | null;
          product_id: string | null;
          product_name: string;
          product_slug: string | null;
          variant_title: string | null;
          sku: string | null;
          size: string | null;
          color: string | null;
          material: string | null;
          metal: string | null;
          gemstone: string | null;
          image_url: string | null;
          quantity: number;
          unit_price_cents: number;
          line_total_cents: number;
          currency: string;
          created_at: string;
        };
        Insert: {
          order_id: string;
          variant_id?: string | null;
          product_id?: string | null;
          product_name: string;
          product_slug?: string | null;
          variant_title?: string | null;
          sku?: string | null;
          size?: string | null;
          color?: string | null;
          material?: string | null;
          metal?: string | null;
          gemstone?: string | null;
          image_url?: string | null;
          quantity: number;
          unit_price_cents: number;
          line_total_cents: number;
          currency?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      payments: TableBase & {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          provider_reference: string | null;
          provider_status: string | null;
          method: string | null;
          amount_cents: number;
          currency: string;
          status: PaymentStatus;
          raw_payload: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          order_id: string;
          provider: string;
          provider_reference?: string | null;
          provider_status?: string | null;
          method?: string | null;
          amount_cents: number;
          currency?: string;
          status?: PaymentStatus;
        };
        Update: Partial<{ provider_reference: string | null; provider_status: string | null; status: PaymentStatus }>;
        Relationships: [];
      };
      order_status_history: TableBase & {
        Row: {
          id: string;
          order_id: string;
          from_status: OrderStatus | null;
          to_status: OrderStatus;
          changed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: { order_id: string; from_status?: OrderStatus | null; to_status: OrderStatus; changed_by?: string | null; note?: string | null };
        Update: Record<string, never>;
        Relationships: [];
      };
      inventory_movements: TableBase & {
        Row: {
          id: string;
          variant_id: string;
          delta: number;
          reason: InventoryMovementReason;
          order_id: string | null;
          performed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: { variant_id: string; delta: number; reason: InventoryMovementReason; order_id?: string | null; performed_by?: string | null; note?: string | null };
        Update: Record<string, never>;
        Relationships: [];
      };
      stock_reservations: TableBase & {
        Row: {
          id: string;
          variant_id: string;
          cart_id: string | null;
          order_id: string | null;
          quantity: number;
          expires_at: string;
          released_at: string | null;
          created_at: string;
        };
        Insert: { variant_id: string; cart_id?: string | null; order_id?: string | null; quantity: number; expires_at: string };
        Update: Partial<{ released_at: string | null }>;
        Relationships: [];
      };
      homepage_sections: TableBase & {
        Row: {
          id: string;
          kind: HomepageSectionKind;
          slug: string;
          title: string | null;
          subtitle: string | null;
          body: string | null;
          image_url: string | null;
          cta_label: string | null;
          cta_href: string | null;
          display_order: number;
          is_active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          kind: HomepageSectionKind;
          slug: string;
          title?: string | null;
          subtitle?: string | null;
          body?: string | null;
          image_url?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          display_order?: number;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: Partial<{
          title: string | null;
          subtitle: string | null;
          body: string | null;
          image_url: string | null;
          cta_label: string | null;
          cta_href: string | null;
          display_order: number;
          is_active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          metadata: Record<string, unknown>;
        }>;
        Relationships: [];
      };
      audit_logs: TableBase & {
        Row: {
          id: string;
          actor_id: string | null;
          actor_role: UserRole | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          actor_role?: UserRole | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_staff_or_admin: { Args: Record<string, never>; Returns: boolean };
      current_user_role: { Args: Record<string, never>; Returns: UserRole };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      discount_kind: DiscountKind;
      discount_applies_to: DiscountAppliesTo;
      inventory_movement_reason: InventoryMovementReason;
      homepage_section_kind: HomepageSectionKind;
    };
    CompositeTypes: Record<string, never>;
  };
};
