import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Required env vars (service context)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('\nMissing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  console.error('Set them and re-run, e.g.:');
  console.error('  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:demo');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

/**
 * Insert helper with simple error handling.
 */
async function insert(table, values, returning = 'minimal') {
  const { data, error } = await admin.from(table).insert(values).select(returning === 'minimal' ? undefined : '*');
  if (error) throw error;
  return data || null;
}

async function upsertProfile(userId, fullName, role) {
  const { error } = await admin.from('profiles').upsert({ id: userId, full_name: fullName, role }, { onConflict: 'id' });
  if (error) throw error;
}

async function ensureAdmin(userId) {
  const { error } = await admin.from('app_admins').upsert({ user_id: userId }, { onConflict: 'user_id' });
  if (error) throw error;
}

async function createUser({ email, password, full_name, role }) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });
  if (error) throw error;
  return data.user;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('Seeding EasySearchSL demo data...');

  // 1) Super Admin
  const superAdminEmail = 'easysearchsl@gmail.com';
  const password = '@password123';
  const superAdminUser = await createUser({ email: superAdminEmail, password, full_name: 'EasySearch Super Admin', role: 'superadmin' });
  await upsertProfile(superAdminUser.id, 'EasySearch Super Admin', 'superadmin');
  await ensureAdmin(superAdminUser.id);
  console.log('✓ Super admin created:', superAdminEmail, superAdminUser.id);

  // 2) Demo businesses
  const businesses = [
    {
      name: 'Lion Tech Solutions',
      owner: { email: 'owner1@demo.local', full_name: 'Alex Conteh' },
      listing: {
        title: 'Computer & Phone Repair',
        description: 'Fast and affordable repairs for laptops, desktops, and smartphones. Same-day service available.',
        category: 'technology',
        tags: ['repair', 'electronics', 'phones'],
        location: { province: 'Western Area', district: 'Urban', chiefdom: 'Freetown' },
        full_address: '12 Lumley Beach Rd, Freetown',
      },
    },
    {
      name: 'Pepper Pot Restaurant',
      owner: { email: 'owner2@demo.local', full_name: 'Mariam Bangura' },
      listing: {
        title: 'Authentic Sierra Leonean Cuisine',
        description: 'Traditional dishes with a modern twist. Dine-in and delivery available.',
        category: 'food & beverage',
        tags: ['restaurant', 'delivery', 'local food'],
        location: { province: 'Western Area', district: 'Rural', chiefdom: 'Waterloo' },
        full_address: '3 Main Rd, Waterloo',
      },
    },
    {
      name: 'GreenFit Gym',
      owner: { email: 'owner3@demo.local', full_name: 'Ibrahim Kamara' },
      listing: {
        title: '24/7 Fitness Center',
        description: 'Fully equipped gym with personal trainers and group classes.',
        category: 'health & fitness',
        tags: ['gym', 'training', 'health'],
        location: { province: 'Southern Province', district: 'Bo', chiefdom: 'Bo' },
        full_address: '45 Bo City Center, Bo',
      },
    },
    {
      name: 'Sunrise Boutique',
      owner: { email: 'owner4@demo.local', full_name: 'Hawa Kallon' },
      listing: {
        title: 'Women’s Fashion & Accessories',
        description: 'Trendy outfits and accessories for every occasion.',
        category: 'retail',
        tags: ['fashion', 'boutique', 'women'],
        location: { province: 'Eastern Province', district: 'Kenema', chiefdom: 'Kenema' },
        full_address: '18 Hangha Rd, Kenema',
      },
    },
    {
      name: 'Bright Minds Academy',
      owner: { email: 'owner5@demo.local', full_name: 'Josephine Sesay' },
      listing: {
        title: 'After-School Tutoring',
        description: 'Math and science tutoring for primary and secondary school students.',
        category: 'education',
        tags: ['tutoring', 'education', 'students'],
        location: { province: 'Northern Province', district: 'Makeni', chiefdom: 'Bombali' },
        full_address: '7 Magburaka Rd, Makeni',
      },
    },
  ];

  for (const b of businesses) {
    // Create business owner user
    const user = await createUser({ email: b.owner.email, password, full_name: b.owner.full_name, role: 'business' });
    await upsertProfile(user.id, b.owner.full_name, 'business');

    // Create organization
    const { data: orgRows, error: orgErr } = await admin
      .from('organizations')
      .insert({ name: b.name, created_by: user.id })
      .select('id')
      .limit(1);
    if (orgErr) throw orgErr;
    const orgId = orgRows[0].id;

    // Add membership as owner
    await insert('organization_members', { organization_id: orgId, user_id: user.id, role: 'owner' });

    // Create listing
    const slug = slugify(`${b.listing.title}-${b.name}`);
    await insert('listings', {
      organization_id: orgId,
      slug,
      title: b.listing.title,
      description: b.listing.description,
      category: b.listing.category,
      tags: b.listing.tags,
      location: b.listing.location,
      full_address: b.listing.full_address,
      business_hours: { monday: { open: '09:00', close: '18:00' } },
      price_range: 'moderate',
      images: [],
      videos: [],
      rating: 4.2,
      review_count: 5,
      booking_enabled: false,
      status: 'published',
      verified: true,
      created_by: user.id,
    });

    console.log(`✓ Seeded business: ${b.name} (${b.owner.email})`);
  }

  console.log('\nAll demo data created successfully.');
}

main().catch((e) => {
  console.error('Seed failed:', e?.message || e);
  process.exit(1);
});
