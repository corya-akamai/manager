
import {
  useQuery,
} from '@tanstack/react-query';

import { useProfile } from 'src/queries/profile/profile';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type {
  APIError,
} from '@linode/api-v4';
import { AccountPermissions } from '@linode/api-v4/src/account';

export const useAccountPermissions = () => {
  const { data: profile } = useProfile();

  return useQuery<AccountPermissions, APIError[]>({
    ...accountQueries.permissions,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};
