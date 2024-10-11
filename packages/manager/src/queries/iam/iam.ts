import {
  AccountPermissions,
  AccountResource,
  APIError,
  UserPermissions,
} from '@linode/api-v4';
import { iamQueries } from './queries';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from 'src/queries/profile/profile';
import { queryPresets } from '../base';

export const useAccountUserPermissions = (username: string) => {
  return useQuery<UserPermissions, APIError[]>(
    iamQueries.user(username)._ctx.permissions
  );
};

export const useAccountResources = () => {
  const { data: profile } = useProfile();

  return useQuery<AccountResource, APIError[]>({
    ...iamQueries.resources,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useAccountPermissions = () => {
  const { data: profile } = useProfile();

  return useQuery<AccountPermissions, APIError[]>({
    ...iamQueries.permissions,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};
