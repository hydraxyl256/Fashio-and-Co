import Link from 'next/link';
import type { Metadata } from 'next';
import { getProfile, getSession } from '@/lib/auth/session';
import { User, Mail, Phone, Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = { title: 'Profile Settings | FASHION & CO.' };

export default async function ProfilePage() {
  const session = await getSession();
  const profile = session ? await getProfile(session.user.id) : null;

  return (
    <div className="bg-[#fef8fc] font-montserrat min-h-screen">
      {/* Sub-header */}
      <div className="bg-[#430562] text-white px-6 md:px-12 py-10">
        <div className="max-w-4xl mx-auto">
          <Link href="/account" className="flex items-center gap-2 text-white/60 text-[12px] uppercase tracking-wider hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-3 h-3" />
            Back to Account
          </Link>
          <h1 className="font-playfair text-[36px] font-bold">Profile Settings</h1>
          <p className="text-white/60 text-[14px] mt-1">Manage your personal information</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 space-y-8">
        
        {/* Avatar / Header Card */}
        <div className="bg-white border border-[#cfc2d1]/30 p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#e6b4ff] flex items-center justify-center border-2 border-[#430562] shrink-0">
            <User className="w-10 h-10 text-[#430562]" />
          </div>
          <div>
            <h2 className="font-playfair text-[24px] font-semibold text-[#430562]">
              {profile?.full_name ?? 'Member Profile'}
            </h2>
            <p className="font-montserrat text-[14px] text-[#7e7480]">
              {profile?.email ?? session?.email ?? ''}
            </p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="bg-white border border-[#cfc2d1]/30">
          <div className="px-8 py-6 border-b border-[#cfc2d1]/30 flex items-center justify-between">
            <h3 className="font-playfair text-[22px] font-semibold text-[#430562]">Personal Information</h3>
            <span className="font-montserrat text-[12px] text-[#7e7480] italic">Read-only — editing coming soon</span>
          </div>
          <div className="divide-y divide-[#cfc2d1]/30">
            {[
              {
                icon: User,
                label: 'Full Name',
                value: profile?.full_name ?? '—',
              },
              {
                icon: Mail,
                label: 'Email Address',
                value: profile?.email ?? session?.email ?? '—',
              },
              {
                icon: Phone,
                label: 'Phone Number',
                value: profile?.phone ?? '—',
              },
              {
                icon: Shield,
                label: 'Marketing Preferences',
                value: profile?.marketing_opt_in ? 'Subscribed to newsletter' : 'Not subscribed',
              },
            ].map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.label} className="flex items-center gap-5 px-8 py-5">
                  <div className="w-8 h-8 bg-[#f2ecf0] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#430562]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-montserrat text-[12px] uppercase tracking-wider text-[#7e7480] mb-0.5">{field.label}</p>
                    <p className="font-montserrat text-[15px] text-[#1d1b1e]">{field.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white border border-[#cfc2d1]/30 p-8 flex items-center justify-between">
          <div>
            <h3 className="font-playfair text-[18px] font-semibold text-[#430562] mb-1">Password & Security</h3>
            <p className="text-[#4d444f] text-[14px]">Manage your password and account security settings.</p>
          </div>
          <Link
            href="/forgot-password"
            className="shrink-0 border border-[#430562] text-[#430562] px-6 py-3 font-montserrat text-[12px] font-semibold uppercase tracking-wider hover:bg-[#430562] hover:text-white transition-all"
          >
            Change Password
          </Link>
        </div>

        <div className="flex gap-4">
          <Link
            href="/account"
            className="border border-[#430562] text-[#430562] px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#430562] hover:text-white transition-all"
          >
            Back to Account
          </Link>
          <Link
            href="/contact"
            className="bg-[#f2ecf0] text-[#430562] px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#e7e1e5] transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
