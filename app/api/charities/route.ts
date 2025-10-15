// File: app/api/charities/route.ts
// Purpose: API route to return list of charities

import { NextResponse } from 'next/server';
import { logger } from '@/utils/prettyLogs';

export const dynamic = 'force-dynamic';

export async function GET() {
  logger.info('API: GET /api/charities', 'CharitiesRoute');

  const charities = [
    {
      id: '1',
      name: 'Red Cross',
      logo: '/logos/red-cross.png',
    },
    {
      id: '2',
      name: 'UNICEF',
      logo: '/logos/unicef-logo.png',
    },
    {
      id: '3',
      name: 'WaterAid',
      logo: '/logos/wateraid-logo.jpg',
    },
    {
      id: '4',
      name: 'Khalsa Aid',
      logo: '/logos/KhalsaAid_logo.png',
    },
    {
      id: '5',
      name: 'Save the Children',
      logo: '/logos/save-the-children.png',
    },
  ];

  return NextResponse.json(charities);
}
