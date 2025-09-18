import { productionRegions } from '@linode/dev-tools/__data__';
import { http } from 'msw';

import { makePaginatedResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from '@linode/dev-tools/mocks';

const mockCoreOnlyRegions = () => {
  return [
    http.get('*/v4*/regions', ({ request }) => {
      return makePaginatedResponse({
        data: productionRegions,
        request,
      });
    }),
  ];
};

export const coreOnlyRegionsPreset: MockPresetExtra = {
  desc: 'Core Only Regions',
  group: { id: 'Regions', type: 'select' },
  handlers: [mockCoreOnlyRegions],
  id: 'regions:core-only',
  label: 'Core Only',
};
