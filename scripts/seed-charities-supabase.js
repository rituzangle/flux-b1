#!/usr/bin/env node
/**
 * scripts/seed-charities-supabase.js
 * Seeds the Supabase charities table with mock charity data
 *
 * Usage:
 *   node scripts/seed-charities-supabase.js
 *
 * Environment variables required (from .env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nEnsure these are set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const mockCharities = [
  {
    slug: 'world-food-program',
    name: 'World Food Program',
    description: 'Fighting hunger worldwide',
    logo_url: '/logos/WorldFoodProgrammeLogo.png',
    impact_rate: 2.0,
    impact_metric: 'meals',
    metadata: {
      category: 'hunger',
      website: 'https://www.wfp.org/',
      emoji: '🌍',
      verified: true,
      donorCount: 127543
    }
  },
  {
    slug: 'khalsa-aid',
    name: 'Khalsa Aid',
    description: 'Humanitarian relief without borders',
    logo_url: '/logos/KhalsaAid_logo.png',
    impact_rate: 0.1,
    impact_metric: 'families helped',
    metadata: {
      category: 'humanitarian',
      website: 'https://khalsaaid.org',
      emoji: '🤝',
      verified: true,
      donorCount: 45231
    }
  },
  {
    slug: 'american-red-cross',
    name: 'American Red Cross',
    description: 'Disaster relief and emergency assistance',
    logo_url: '/logos/Red-Cross-logo.png',
    impact_rate: 5.0,
    impact_metric: 'people helped',
    metadata: {
      category: 'emergency',
      website: 'https://www.redcross.org/',
      emoji: '🚑',
      verified: true,
      donorCount: 892014
    }
  },
  {
    slug: 'unicef',
    name: 'UNICEF',
    description: 'Every child deserves a fair chance',
    logo_url: '/logos/unicef-logo.png',
    impact_rate: 3.0,
    impact_metric: 'children supported',
    metadata: {
      category: 'children',
      website: 'https://www.unicef.org/',
      emoji: '👶',
      verified: true,
      donorCount: 654321
    }
  },
  {
    slug: 'save-the-children',
    name: 'Save the Children',
    description: 'Giving children a healthy start in life',
    logo_url: '/logos/save-the-children.png',
    impact_rate: 4.0,
    impact_metric: 'school days funded',
    metadata: {
      category: 'children',
      website: 'https://www.savethechildren.org/',
      emoji: '🎈',
      verified: true,
      donorCount: 423876
    }
  },
  {
    slug: 'children-international',
    name: 'Children International',
    description: 'Breaking the cycle of poverty for children',
    logo_url: '/logos/Children-International-logo.png',
    impact_rate: 0.5,
    impact_metric: 'care packages',
    metadata: {
      category: 'children',
      website: 'https://www.children.org/',
      emoji: '❤️',
      verified: true,
      donorCount: 198234
    }
  },
  {
    slug: 'water-aid',
    name: 'Water Aid',
    description: '#TeamWater to bring clean water to 2 million people around the world.',
    logo_url: '/logos/WaterAid-logo.jpg',
    impact_rate: 0.5,
    impact_metric: 'care packages',
    metadata: {
      category: 'humanitarian',
      website: 'https://www.wateraid.org/us/',
      emoji: '💧',
      verified: true,
      donorCount: 898234
    }
  },
  {
    slug: 'family-giving-tree',
    name: 'Family Giving Tree',
    description: 'Bringing Joy. Growing Hope. Creating Community.',
    logo_url: '/logos/Family-giving-tree-logo.png',
    impact_rate: 0.5,
    impact_metric: 'gift bundles',
    metadata: {
      category: 'holiday',
      website: 'https://familygivingtree.org/',
      emoji: '🎄',
      verified: true,
      donorCount: 998
    }
  }
];

async function seedCharities() {
  console.log('🌱 Starting charity seeding process...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`📊 Charities to seed: ${mockCharities.length}\n`);

  try {
    console.log('🔍 Checking existing charities...');
    const { data: existing, error: fetchError } = await supabase
      .from('charities')
      .select('slug');

    if (fetchError) {
      console.error('❌ Failed to fetch existing charities:', fetchError.message);
      process.exit(1);
    }

    const existingSlugs = new Set((existing || []).map(c => c.slug));
    console.log(`   Found ${existingSlugs.size} existing charities\n`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const charity of mockCharities) {
      const exists = existingSlugs.has(charity.slug);

      if (exists) {
        console.log(`🔄 Updating: ${charity.name}`);
        const { error: updateError } = await supabase
          .from('charities')
          .update({
            name: charity.name,
            description: charity.description,
            logo_url: charity.logo_url,
            impact_rate: charity.impact_rate,
            impact_metric: charity.impact_metric,
            metadata: charity.metadata,
            updated_at: new Date().toISOString()
          })
          .eq('slug', charity.slug);

        if (updateError) {
          console.error(`   ❌ Failed: ${updateError.message}`);
          skipped++;
        } else {
          console.log(`   ✅ Updated successfully`);
          updated++;
        }
      } else {
        console.log(`➕ Inserting: ${charity.name}`);
        const { error: insertError } = await supabase
          .from('charities')
          .insert([charity]);

        if (insertError) {
          console.error(`   ❌ Failed: ${insertError.message}`);
          skipped++;
        } else {
          console.log(`   ✅ Inserted successfully`);
          inserted++;
        }
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   ➕ Inserted: ${inserted}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📈 Total processed: ${mockCharities.length}`);

    console.log('\n✅ Seeding complete!');
    console.log('\n🔍 Verify by running:');
    console.log('   SELECT id, name, slug FROM charities; in Supabase SQL Editor\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Unexpected error:', err);
    process.exit(1);
  }
}

seedCharities();
