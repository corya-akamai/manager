import { getProfile } from '@linode/api-v4';
import { profileFactory } from '@linode/utilities';
import { http } from 'msw';

import { accountSettingsFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeErrorResponse,
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type {
  AccountSettings,
  Profile,
  TfaOptionalUser,
  UpdateTfaOptionalUsersPayload,
  UpdateTfaOptionalUsersResponse,
  User,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockPresetExtra } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export interface TfaEnforcementMockData {
  tfaEnforced: boolean;
  tfaOptionalUsers: string[];
}

const defaultTfaEnforcementData: TfaEnforcementMockData = {
  tfaEnforced: true,
  tfaOptionalUsers: [],
};

let tfaEnforcementData: null | TfaEnforcementMockData = null;

export const setTfaEnforcementData = (data: null | TfaEnforcementMockData) => {
  tfaEnforcementData = data;
};

export const getTfaEnforcementData = () => tfaEnforcementData;

const getData = () => tfaEnforcementData ?? defaultTfaEnforcementData;

const getUserTfaEnforced = (username: string) => {
  const data = getData();

  if (data.tfaOptionalUsers.includes(username)) {
    return false;
  }

  return data.tfaEnforced;
};

const withUserTfaEnforced = (user: User): User => ({
  ...user,
  tfa_enforced: getUserTfaEnforced(user.username),
});

const withUsersTfaEnforced = (users: User[]) =>
  users.map((user) => withUserTfaEnforced(user));

const withProfileTfaEnforced = (): Profile => {
  const profile = profileFactory.build();

  return {
    ...profile,
    tfa_enforced: getUserTfaEnforced(profile.username),
  };
};

const toTfaOptionalUser = (username: string): TfaOptionalUser => ({
  url: `/account/users/${username}`,
  username,
});

const filterUsersByProfileType = async (users: User[]) => {
  const profile = await getProfile();
  const userTypeFromProfile = profile?.user_type;

  if (userTypeFromProfile === 'default') {
    return users.filter((user) => user.user_type === 'default');
  }

  if (userTypeFromProfile === 'parent') {
    return users.filter((user) => user.user_type === 'parent');
  }

  if (userTypeFromProfile === 'child') {
    return users.filter(
      (user) => user.user_type === 'child' || user.user_type === 'delegate'
    );
  }

  return users;
};

const mockTfaEnforcement = () => [
  http.get('*/v4*/account/settings', () => {
    return makeResponse(
      accountSettingsFactory.build({ tfa_enforced: getData().tfaEnforced })
    );
  }),

  http.put(
    '*/v4*/account/settings',
    async ({ request }): Promise<StrictResponse<AccountSettings>> => {
      const body = (await request.json()) as Partial<AccountSettings>;
      const tfaEnforced = body.tfa_enforced ?? getData().tfaEnforced;

      tfaEnforcementData = {
        ...getData(),
        tfaEnforced,
      };

      return makeResponse(
        accountSettingsFactory.build({ ...body, tfa_enforced: tfaEnforced })
      );
    }
  ),

  http.get('*/v4*/profile', () => {
    return makeResponse(withProfileTfaEnforced());
  }),

  http.get('*/v4beta/account/tfa-optional-users', ({ request }) => {
    const data = getData().tfaOptionalUsers.map(toTfaOptionalUser);

    return makePaginatedResponse({
      data,
      request,
    });
  }),

  http.put(
    '*/v4beta/account/tfa-optional-users',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | UpdateTfaOptionalUsersResponse>
    > => {
      const body = (await request.json()) as UpdateTfaOptionalUsersPayload;
      const users = await mswDB.getAll('users');
      const invalidUsernames = body.usernames.filter(
        (username) => !users?.some((user) => user.username === username)
      );

      if (invalidUsernames.length > 0) {
        return makeErrorResponse(
          `Invalid username: ${invalidUsernames.join(', ')}`
        );
      }

      tfaEnforcementData = {
        ...getData(),
        tfaOptionalUsers: body.usernames,
      };

      const response: UpdateTfaOptionalUsersResponse = {
        tfa_optional_users_count: body.usernames.length,
        url: '/account/tfa-optional-users',
      };

      return makeResponse(response);
    }
  ),

  http.get(
    '*/v4*/account/users',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<User>>
    > => {
      const users = await mswDB.getAll('users');

      if (!users) {
        return makeNotFoundResponse();
      }

      const filteredUsers = await filterUsersByProfileType(users);

      return makePaginatedResponse({
        data: withUsersTfaEnforced(filteredUsers),
        request,
      });
    }
  ),

  http.get(
    '*/v4*/account/users/:username',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | User>> => {
      const username = params.username as string;
      const users = await mswDB.getAll('users');
      const user = users?.find((entry) => entry.username === username);

      if (!user) {
        return makeNotFoundResponse();
      }

      return makeResponse(withUserTfaEnforced(user));
    }
  ),
];

export const tfaEnforcementPreset: MockPresetExtra = {
  desc: 'Mocks tfa_enforced on profile, account settings (v4 + v4beta), optional users (v4beta), and account users. Use with CRUD baseline: enable this preset, toggle "Enforce 2FA for all users", and enable iamTfaEnforcement.',
  group: { id: 'Account', type: 'account' },
  handlers: [mockTfaEnforcement],
  id: 'account:tfa-enforcement',
  label: '2FA Enforcement',
};
