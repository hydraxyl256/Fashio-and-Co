'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateHouseSettingAction } from '@/lib/admin/actions/users';

interface SettingsFormProps {
  initialValues: {
    site_name: string;
    support_email: string;
    default_currency: string;
    announcement: string;
  };
}

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const router = useRouter();
  const [siteName, setSiteName] = React.useState(initialValues.site_name);
  const [supportEmail, setSupportEmail] = React.useState(initialValues.support_email);
  const [defaultCurrency, setDefaultCurrency] = React.useState(initialValues.default_currency);
  const [announcement, setAnnouncement] = React.useState(initialValues.announcement);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function save(key: string, value: unknown) {
    const result = await updateHouseSettingAction({ key, value });
    if (!result.ok) {
      setError(result.error ?? 'Could not save.');
      toast.error(result.error ?? 'Could not save.');
      return false;
    }
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const results = await Promise.all([
      save('site_name', { value: siteName }),
      save('support_email', { value: supportEmail }),
      save('default_currency', { value: defaultCurrency }),
      save('announcement', { value: announcement }),
    ]);
    setBusy(false);
    if (results.every(Boolean)) {
      toast.success('Settings saved.');
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="s-name">Site name</Label>
              <Input
                id="s-name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="mt-1"
                required
                maxLength={80}
              />
            </div>
            <div>
              <Label htmlFor="s-email">Support email</Label>
              <Input
                id="s-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="mt-1"
                required
                maxLength={120}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="s-cur">Default currency</Label>
              <Input
                id="s-cur"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase().slice(0, 3))}
                className="mt-1 uppercase"
                maxLength={3}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="s-ann">Announcement banner</Label>
            <Textarea
              id="s-ann"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="mt-1"
              rows={2}
              maxLength={280}
              placeholder="Free shipping over KES 5,000 in Nairobi"
            />
            <p className="mt-1 text-[0.7rem] text-muted-foreground">
              Optional. Shown across the top of the storefront when set.
            </p>
          </div>
          {error ? (
            <p className="rounded border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  );
}
