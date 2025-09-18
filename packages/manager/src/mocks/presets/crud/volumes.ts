import {
  createVolumes,
  deleteVolumes,
  getVolumes,
  updateVolumes,
} from 'src/mocks/presets/crud/handlers/volumes';

import type { MockPresetCrud } from '@linode/dev-tools/mocks';

export const volumeCrudPreset: MockPresetCrud = {
  group: { id: 'Volumes' },
  handlers: [createVolumes, deleteVolumes, updateVolumes, getVolumes],
  id: 'volumes:crud',
  label: 'Volumes CRUD',
};
