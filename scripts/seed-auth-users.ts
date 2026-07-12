/**
 * scripts/seed-auth-users.ts
 *
 * Creates real demo auth users via the Supabase Admin API.
 * This is the ONLY supported way to create loginable accounts on hosted Supabase.
 * Direct SQL inserts into auth.users do NOT work on hosted projects.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-auth-users.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Admin client — required for auth.admin.createUser
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface DemoUser {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'staff' | 'customer';
  address?: {
    label: string;
    recipientName: string;
    phone: string;
    line1: string;
    city: string;
    country: string;
  };
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'admin@fashionandco.com',
    password: 'password123',
    fullName: 'Admin User',
    role: 'admin',
  },
  {
    email: 'staff@fashionandco.com',
    password: 'password123',
    fullName: 'Staff User',
    role: 'staff',
  },
  {
    email: 'vip@example.com',
    password: 'password123',
    fullName: 'VIP Customer',
    role: 'customer',
    address: {
      label: 'Home',
      recipientName: 'VIP Customer',
      phone: '+254712345678',
      line1: 'Westlands, Ring Road',
      city: 'Nairobi',
      country: 'KE',
    },
  },
  {
    email: 'customer@example.com',
    password: 'password123',
    fullName: 'Regular Customer',
    role: 'customer',
    address: {
      label: 'Home',
      recipientName: 'Regular Customer',
      phone: '+254798765432',
      line1: 'Karen Road',
      city: 'Nairobi',
      country: 'KE',
    },
  },
];

async function seedUser(user: DemoUser) {
  console.log(`\nProcessing: ${user.email}...`);

  // 1. List all users and find if this email already exists
  const { data: existingList, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (listErr) {
    console.error(`  ✗ listUsers failed: ${listErr.message}`);
  }
  const existing = existingList?.users.find(u => u.email === user.email);

  let userId: string;

  if (existing) {
    console.log(`  → Found existing user (${existing.id}). Trying to update...`);
    
    const { data: updateData, error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    });
    
    if (updateErr) {
      // The existing user may be in a broken state from a raw SQL insert.
      // Delete it and recreate cleanly.
      console.warn(`  ! Update failed (${updateErr.message}). Deleting broken user and recreating...`);
      const { error: delErr } = await supabase.auth.admin.deleteUser(existing.id);
      if (delErr) {
        console.error(`  ✗ Delete failed: ${delErr.message}`);
        return;
      }
      console.log(`  → Deleted broken user. Recreating...`);
      // Fall through to create below
      const { data: freshData, error: freshErr } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.fullName },
      });
      if (freshErr || !freshData?.user) {
        console.error(`  ✗ Recreate failed: ${freshErr?.message} | ${JSON.stringify(freshErr)}`);
        return;
      }
      userId = freshData.user.id;
      console.log(`  → Recreated auth user (${userId})`);
    } else {
      console.log(`  → Updated existing user: ${updateData?.user?.email}`);
      userId = existing.id;
    }
  } else {
    // 2. Create fresh auth user via Admin API
    const { data, error: createErr } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    });

    if (createErr) {
      console.error(`  ✗ Failed to create auth user: ${createErr.message} | status: ${createErr.status}`);
      return;
    }
    if (!data?.user) {
      console.error(`  ✗ createUser returned no user and no error`);
      return;
    }
    userId = data.user.id;
    console.log(`  → Created auth user (${userId})`);
  }

  // 3. Upsert profile (the trigger handles this on new users, but may not exist for existing ones)
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({ id: userId, email: user.email, full_name: user.fullName }, { onConflict: 'id' });

  if (profileErr) {
    console.error(`  ✗ Profile upsert failed: ${profileErr.message}`);
  } else {
    console.log(`  → Profile upserted`);
  }

  // 4. Upsert role — admin/staff need explicit override over default 'customer'
  const { error: roleErr } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role: user.role }, { onConflict: 'user_id' });

  if (roleErr) {
    console.error(`  ✗ Role upsert failed: ${roleErr.message}`);
  } else {
    console.log(`  → Role set to "${user.role}"`);
  }

  // 5. Address (customers only)
  if (user.address) {
    const { error: addrErr } = await supabase.from('addresses').upsert(
      {
        user_id: userId,
        label: user.address.label,
        recipient_name: user.address.recipientName,
        phone: user.address.phone,
        line1: user.address.line1,
        city: user.address.city,
        country: user.address.country,
        is_default_shipping: true,
        is_default_billing: true,
      },
      { onConflict: 'user_id,label' },
    );

    if (addrErr) {
      console.error(`  ✗ Address upsert failed: ${addrErr.message}`);
    } else {
      console.log(`  → Address seeded`);
    }
  }

  console.log(`  ✓ ${user.email} ready`);
}

async function main() {
  console.log('='.repeat(55));
  console.log(' Fashion & Co. — Demo Auth User Seeder');
  console.log('='.repeat(55));
  console.log(`Target: ${supabaseUrl}`);

  for (const user of DEMO_USERS) {
    await seedUser(user);
  }

  console.log('\n' + '='.repeat(55));
  console.log(' Seeding complete. Demo credentials:');
  console.log('='.repeat(55));
  for (const u of DEMO_USERS) {
    console.log(`  ${u.role.padEnd(10)} ${u.email.padEnd(32)} password123`);
  }
  console.log('='.repeat(55));
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
