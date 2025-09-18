import { getQuotas, getS3Endpoint } from './handlers/quotas';

import type { MockPresetCrud } from '@linode/dev-tools/mocks';

export const quotasCrudPreset: MockPresetCrud = {
  group: { id: 'Quotas' },
  handlers: [getQuotas, getS3Endpoint],
  id: 'quotas:crud',
  label: 'Quotas CRUD',
};
