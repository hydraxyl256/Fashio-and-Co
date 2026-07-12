import 'server-only';

import { headers } from 'next/headers';

import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/session';

/**
 * Privileged-write audit log helper.
 *
 * Every server action that mutates staff-protected tables (products,
 * inventory, order status, discounts, delivery, content, user roles)
 * should call `logAudit()` after the primary write succeeds.
 *
 * Audit logging must NEVER block the primary write — if the audit insert
 * fails for any reason, we log to stderr and let the action return
 * success. The system-of-record is the action's effect, not its log.
 */
export interface LogAuditInput {
  /** Verb-style identifier: e.g. 'product.update', 'order.status_change'. */
  action: string;
  /** Snake-case entity type: e.g. 'product', 'order', 'variant'. */
  entityType?: string;
  /** Primary key of the affected entity. */
  entityId?: string;
  /** Free-form context: changed field names, before/after values, etc. */
  metadata?: Record<string, unknown>;
}

export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    const [admin, session] = await Promise.all([
      createSupabaseServiceRoleClient(),
      getSession(),
    ]);
    let ip: string | null = null;
    let userAgent: string | null = null;
    try {
      const h = await headers();
      ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
      userAgent = h.get('user-agent') ?? null;
    } catch {
      /* `headers()` is not always available (e.g. in some background contexts). */
    }
    await admin.from('audit_logs').insert({
      actor_id: session?.user.id ?? null,
      actor_role: session?.role ?? null,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      ip_address: ip,
      user_agent: userAgent,
      metadata: input.metadata ?? {},
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[audit] failed to write log entry', { action: input.action, error });
  }
}
