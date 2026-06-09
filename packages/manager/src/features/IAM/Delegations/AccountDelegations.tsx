import {
  FormError,
  FormField,
  FormLabel,
  NotificationBanner,
  SearchField,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useGetChildAccountsQuery } from '@linode/queries';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React, { useCallback } from 'react';
import { debounce } from 'throttle-debounce';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import globalStyles from 'src/features/IAM/Shared/global.module.css';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { usePermissions } from '../hooks/usePermissions';
import { Paper } from '../Shared/Paper/Paper';
import { AccountDelegationsTable } from './AccountDelegationsTable';

const DELEGATIONS_ROUTE = '/iam/delegations';

export const AccountDelegations = () => {
  const navigate = useNavigate();
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'account',
    ['list_all_child_accounts']
  );

  const { company } = useSearch({
    from: '/iam',
  });
  const theme = useTheme();

  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isLgDown = useMediaQuery(theme.breakpoints.up('lg'));

  const numColsLg = isLgDown ? 3 : 2;
  const numCols = isSmDown ? 2 : numColsLg;

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'company',
      },
      from: DELEGATIONS_ROUTE,
    },
    preferenceKey: 'iam-delegations-pagination',
  });

  const pagination = usePaginationV2({
    currentRoute: DELEGATIONS_ROUTE,
    preferenceKey: 'iam-delegations-pagination',
    initialPage: 1,
    searchParams: (prev) => ({
      ...prev,
      company: company || undefined,
    }),
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...(company && { company: { '+contains': company } }),
  };

  const {
    data: childAccountsWithDelegates,
    isFetching,
    isLoading,
    error,
  } = useGetChildAccountsQuery({
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    users: true,
    filter,
  });

  const handleSearch = useCallback(
    (value: string) => {
      pagination.handlePageChange(1);
      navigate({
        to: DELEGATIONS_ROUTE,
        search: { company: value || undefined },
      });
    },
    [navigate, pagination]
  );

  const debouncedHandleSearch = React.useMemo(
    () => debounce(250, handleSearch),
    [handleSearch]
  );

  if (!permissions?.list_all_child_accounts) {
    return (
      <NotificationBanner
        text="You do not have permission to view account delegations."
        type="error"
      />
    );
  }

  return (
    <Paper>
      <FormField
        error={Boolean(error?.[0]?.reason)}
        labelPosition="top"
        style={{ padding: 0, marginBottom: Spacing.S16 }}
      >
        <FormLabel
          className={globalStyles.visuallyHidden}
          htmlFor="filter-delegations"
          slot="label"
        >
          Search Accounts
        </FormLabel>

        <SearchField
          id="filter-delegations"
          isLoading={isFetching}
          onChange={(e: CustomEvent<{ value: string }>) =>
            debouncedHandleSearch(e.detail.value)
          }
          placeholder="Filter"
          style={{ padding: 0 }}
          value={company ?? ''}
        />
        <FormError slot="error">{error?.[0]?.reason}</FormError>
      </FormField>
      <AccountDelegationsTable
        delegations={childAccountsWithDelegates?.data ?? []}
        error={error}
        handleOrderChange={handleOrderChange}
        isLoading={isLoading || isPermissionsLoading}
        numCols={numCols}
        order={order}
        orderBy={orderBy}
      />
      <PaginationFooter
        count={childAccountsWithDelegates?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </Paper>
  );
};
