import {
  createCloudNAT,
  deleteCloudNAT,
  getCloudNATs,
  updateCloudNAT,
} from 'src/mocks/presets/crud/handlers/cloudnats';

import type { MockPresetCrud } from '@linode/dev-tools/mocks';

export const cloudNATCrudPreset: MockPresetCrud = {
  group: { id: 'CloudNATs' },
  handlers: [createCloudNAT, deleteCloudNAT, updateCloudNAT, getCloudNATs],
  id: 'cloudnats:crud',
  label: 'CloudNATs CRUD',
};
