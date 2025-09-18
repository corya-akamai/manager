import { userAccountPermissionsFactory } from '@linode/dev-tools/factories';
import { http } from 'msw';

import { makeResponse } from 'src/mocks/utilities/response';

import type { PermissionType } from '@linode/api-v4';
import type { MockPresetExtra } from '@linode/dev-tools/mocks';

let customUserAccountPermissionsData: null | PermissionType[] = null;

export const setCustomUserAccountPermissionsData = (
  data: null | PermissionType[]
) => {
  customUserAccountPermissionsData = data;
};

const mockCustomUserAccountPermissions = () => {
  return [
    http.get('*/v4*/iam/users/:username/permissions/account', async () => {
      return makeResponse(
        customUserAccountPermissionsData
          ? customUserAccountPermissionsData
          : userAccountPermissionsFactory
      );
    }),
  ];
};

export const customUserAccountPermissionsPreset: MockPresetExtra = {
  desc: 'Custom User Account Permissions',
  group: { id: 'User Permissions', type: 'userPermissions' },
  handlers: [mockCustomUserAccountPermissions],
  id: 'userAccountPermissions:custom',
  label: 'Custom User Account Permissions',
};
