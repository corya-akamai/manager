import { useQuery } from '@tanstack/react-query';
import { profileQueries, useProfile } from 'src/queries/profile/profile';
import { queryPresets } from '../base';
import type { APIError } from '@linode/api-v4';
import { ProfilePermissions } from '@linode/api-v4/src/profile/types';

export const useProfilePermissions = () => {
  const { data: profile } = useProfile();
  return useQuery<ProfilePermissions, APIError[]>({
    ...profileQueries.permissions,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: Boolean(profile?.restricted),
  });
};
