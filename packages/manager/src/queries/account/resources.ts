
import {
  useQuery,
} from '@tanstack/react-query';

import { useProfile } from 'src/queries/profile/profile';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type {
  APIError,
} from '@linode/api-v4';
import { AccountResource } from '@linode/api-v4/src/account';

export const useAccountResources = () => {
  const { data: profile } = useProfile();

  return useQuery<AccountResource, APIError[]>({
    ...accountQueries.resources,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};
