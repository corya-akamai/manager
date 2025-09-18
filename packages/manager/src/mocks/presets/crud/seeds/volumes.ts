import { volumeFactory } from '@linode/dev-tools/factories';

import { getSeedsCountMap } from 'src/dev-tools/utils';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from '@linode/dev-tools/mocks';

export const volumesSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Volumes Seeds',
  group: { id: 'Volumes' },
  id: 'volumes:crud',
  label: 'Volumes',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[volumesSeeder.id] ?? 0;
    const volumes = volumeFactory.buildList(count);

    const updatedMockState = {
      ...mockState,
      volumes: mockState.volumes.concat(volumes),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};
