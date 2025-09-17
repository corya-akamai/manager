import type { AccountSettings } from '@linode/api-v4';
import type { FlagSet } from '@linode/core/featureFlags';
import type { QueryClient } from '@tanstack/react-query';

export type RouterContext = {
  accountSettings?: AccountSettings;
  flags: FlagSet;
  globalErrors?: {
    account_unactivated?: boolean;
  };
  isACLPEnabled?: boolean;
  isDatabasesEnabled?: boolean;
  isPlacementGroupsEnabled?: boolean;
  queryClient: QueryClient;
};

export interface TableSearchParams {
  order?: 'asc' | 'desc';
  orderBy?: string;
  page?: number;
  pageSize?: number;
}
