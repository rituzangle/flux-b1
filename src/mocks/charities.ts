// src/mocks/charities.ts
// canonical mock charities used in dev
// This file is written so it works with both TypeScript/Next imports and plain Node require().
import { Charity } from '@/src/utils/types';

export const mockCharities: Charity[] = [
  {
    id: 'charity-1',
    name: 'World Food Program',
    description: 'Fighting hunger worldwide',
    logo: '/logos/WorldFoodProgrammeLogo.png',
    website: 'https://www.wfp.org/',
    emoji: '🌍',
    verified: true,
    donorCount: 127543,
    impactMetric: 'meals',
    impactRate: 2,
    category: 'hunger',
  },
  {
    id: 'charity-2',
    name: 'Khalsa Aid',
    description: 'Humanitarian relief without borders',
    logo: '/logos/KhalsaAid_logo.png',
    website: 'https://khalsaaid.org',
    emoji: '🤝',
    verified: true,
    donorCount: 45231,
    impactMetric: 'families helped',
    impactRate: 0.1,
    category: 'humanitarian',
  },
  {
    id: 'charity-3',
    name: 'American Red Cross',
    description: 'Disaster relief and emergency assistance',
    logo: '/logos/Red-Cross-logo.png',
    website: 'https://www.redcross.org/',
    emoji: '🚑',
    verified: true,
    donorCount: 892014,
    impactMetric: 'people helped',
    impactRate: 5,
    category: 'emergency',
  },
  {
    id: 'charity-4',
    name: 'UNICEF',
    description: 'Every child deserves a fair chance',
    logo: '/logos/unicef-logo.png',
    website: 'https://www.unicef.org/',
    emoji: '👶',
    verified: true,
    donorCount: 654321,
    impactMetric: 'children supported',
    impactRate: 3,
    category: 'children',
  },
  {
    id: 'charity-5',
    name: 'Save the Children',
    description: 'Giving children a healthy start in life',
    logo: '/logos/save-the-children.png',
    website: 'https://www.savethechildren.org/',
    emoji: '🎈',
    verified: true,
    donorCount: 423876,
    impactMetric: 'school days funded',
    impactRate: 4,
    category: 'children',
  },
  {
    id: 'charity-6',
    name: 'Children International',
    description: 'Breaking the cycle of poverty for children',
    logo: '/logos/Children-International-logo.png',
    website: 'https://www.children.org/',
    emoji: '❤️',
    verified: true,
    donorCount: 198234,
    impactMetric: 'care packages',
    impactRate: 0.5,
    category: 'children',
  },
  
  {
    id: 'charity-7',
    name: 'Water Aid',
    description: '#TeamWater to bring clean water to 2 million people around the world.',
    logo: '/logos/WaterAid-logo.jpg',
    website: 'https://www.wateraid.org/us/',
    emoji: '💧',
    verified: true,
    donorCount: 898234,
    impactMetric: 'care packages',
    impactRate: 0.5,
    category: 'humanitarian',
  },
  {
  id: 'charity-8',
  name: 'Family Giving Tree',
  description: 'Bringing Joy. Growing Hope. Creating Community.',
  logo: '/logos/Family-giving-tree-logo.png',
  website: 'https://familygivingtree.org/',
  emoji: '🎄',
  verified: true,
  donorCount: 998,
  impactMetric: 'gift bundles',
  impactRate: 0.5,
  category: 'holiday',
},

];
export const charities = mockCharities;

// Also provide a CommonJS-compatible export so require() from Node finds the array.
declare const module: any;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Object.assign(module.exports || {}, { mockCharities, charities });
}
