import { EmptyState } from '@/components/ui/empty-state';
import { MapPin } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export const metadata = { title: 'Addresses' };

export default async function AddressesPage() {
  const session = await getSession();
  const supabase = await createSupabaseServerClient();
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', session?.user.id ?? '')
    .order('created_at', { ascending: false });

  const rawAddresses = addresses ?? [];
  // Cast to avoid 'never' type when the table isn't reflected in generated types
  const list = rawAddresses as Array<{
    id: string;
    label: string | null;
    recipient_name: string;
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    country: string;
  }>;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Addresses</p>
          <h2 className="mt-2 font-serif text-2xl">Shipping & billing</h2>
        </div>
      </header>

      {list.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-8 w-8" aria-hidden />}
          title="No addresses on file"
          description="Address management UI ships with the checkout milestone."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li
              key={a.id}
              className="border border-border bg-card p-5 text-sm leading-relaxed"
            >
              <p className="eyebrow">{a.label ?? 'Address'}</p>
              <p className="mt-2 font-medium">{a.recipient_name}</p>
              <p className="text-muted-foreground">{a.line1}</p>
              {a.line2 ? <p className="text-muted-foreground">{a.line2}</p> : null}
              <p className="text-muted-foreground">
                {a.city}
                {a.region ? `, ${a.region}` : ''}
              </p>
              <p className="mt-1 text-muted-foreground">{a.country}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
