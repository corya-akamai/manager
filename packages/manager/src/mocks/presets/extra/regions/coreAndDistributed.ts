import { distributedRegions } from '@linode/dev-tools/__data__';
import { productionRegions } from '@linode/dev-tools/__data__';
import { http } from 'msw';

import { makePaginatedResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from '@linode/dev-tools/mocks';

const mockCoreAndDistributedRegions = () => {
  return [
    http.get('*/v4*/regions', ({ request }) => {
      return makePaginatedResponse({
        data: [...productionRegions, ...distributedRegions],
        request,
      });
    }),
  ];
};

export const coreAndDistributedRegionsPreset: MockPresetExtra = {
  desc: 'Core and Distributed Regions',
  group: { id: 'Regions', type: 'select' },
  handlers: [mockCoreAndDistributedRegions],
  id: 'regions:core-and-distributed',
  label: 'Core + Distributed',
};
