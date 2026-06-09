import {
  FormField,
  FormLabel,
  SearchField,
} from '@akamai/cds-components/react';
import { useGetDelegatedChildAccountsForUserQuery } from '@linode/queries';
import { Stack, Typography } from '@linode/ui';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { NO_ITEMS_TO_DISPLAY_TEXT } from 'src/features/IAM/Shared/constants';
import { ErrorState } from 'src/features/IAM/Shared/ErrorState/ErrorState';
import globalStyles from 'src/features/IAM/Shared/global.module.css';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { Paper } from '../../Shared/Paper/Paper';

import type { Theme } from '@mui/material';

const USER_DELEGATION_ROUTE = '/iam/users/$username/delegations';

export const UserDelegationsTable = () => {
  const { username } = useParams({ from: '/iam/users/$username' });
  const { company } = useSearch({
    from: USER_DELEGATION_ROUTE,
  });
  const navigate = useNavigate();

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'company',
      },
      from: USER_DELEGATION_ROUTE,
    },
    preferenceKey: 'user-delegations',
  });

  const pagination = usePaginationV2({
    currentRoute: USER_DELEGATION_ROUTE,
    preferenceKey: 'user-delegations',
    initialPage: 1,
    searchParams: (prev) => ({
      ...prev,
      company: company || undefined,
    }),
  });

  const filter = {
    company: {
      '+contains': company,
    },
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const {
    data: childAccounts,
    isFetching: isFetchingChildAccounts,
    isLoading: isLoadingChildAccounts,
    error: errorChildAccounts,
  } = useGetDelegatedChildAccountsForUserQuery({
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    username,
    filter,
  });

  const handleSearch = React.useCallback(
    (value: string) => {
      pagination.handlePageChange(1);
      navigate({
        to: USER_DELEGATION_ROUTE,
        params: { username },
        search: { company: value || undefined },
      });
    },
    [navigate, pagination, username]
  );

  const debouncedHandleSearch = React.useMemo(
    () => debounce(250, handleSearch),
    [handleSearch]
  );

  if (isLoadingChildAccounts) {
    return <CircleProgress />;
  }

  if (errorChildAccounts) {
    return <ErrorState errorText={errorChildAccounts[0].reason} />;
  }

  return (
    <Paper>
      <Stack>
        <Typography variant="h2">Account Delegations</Typography>
        <FormField labelPosition="top" style={{ padding: 0 }}>
          <FormLabel
            className={globalStyles.visuallyHidden}
            htmlFor="filter-delegations"
            slot="label"
          >
            Search Accounts
          </FormLabel>
          <SearchField
            id="filter-delegations"
            isLoading={isFetchingChildAccounts}
            onChange={(e: CustomEvent<{ value: string }>) =>
              debouncedHandleSearch(e.detail.value)
            }
            placeholder="Search"
            style={{ padding: 0 }}
            value={company ?? ''}
          />
        </FormField>
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableSortCell
                active={orderBy === 'company'}
                direction={order}
                handleClick={handleOrderChange}
                label={'company'}
              >
                Account
              </TableSortCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {childAccounts?.data.length === 0 && (
              <TableRowEmpty colSpan={1} message={NO_ITEMS_TO_DISPLAY_TEXT} />
            )}
            {childAccounts?.data?.map((childAccount) => (
              <TableRow key={childAccount.euuid}>
                <TableCell>{childAccount.company}</TableCell>
              </TableRow>
            ))}
            {(childAccounts?.results ?? 0) > MIN_PAGE_SIZE && (
              <TableRow>
                <TableCell
                  colSpan={1}
                  sx={(theme: Theme) => ({
                    padding: 0,
                    '& > div': {
                      border: 'none',
                      borderTop: `1px solid ${theme.borderColors.divider}`,
                    },
                  })}
                >
                  <PaginationFooter
                    count={childAccounts?.results ?? 0}
                    eventCategory="DelegatedChildAccounts"
                    handlePageChange={pagination.handlePageChange}
                    handleSizeChange={pagination.handlePageSizeChange}
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
};
