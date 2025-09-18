import {
  createSubnet,
  createVPC,
  deleteSubnet,
  deleteVPC,
  getVPCIPs,
  getVPCs,
  updateSubnet,
  updateVPC,
} from './handlers/vpcs';

import type { MockPresetCrud } from '@linode/dev-tools/mocks';

export const vpcCrudPreset: MockPresetCrud = {
  group: { id: 'VPCs' },
  handlers: [
    createVPC,
    createSubnet,
    deleteSubnet,
    deleteVPC,
    getVPCIPs,
    getVPCs,
    updateSubnet,
    updateVPC,
  ],
  id: 'vpcs:crud',
  label: 'VPC CRUD',
};
