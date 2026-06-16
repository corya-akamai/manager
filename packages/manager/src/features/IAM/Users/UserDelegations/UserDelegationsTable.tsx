import {
  FormField,
  FormLabel,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useGetDelegatedChildAccountsForUserQuery } from '@linode/queries';
import { Typography } from '@linode/ui';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { NO_ITEMS_TO_DISPLAY_TEXT } from 'src/features/IAM/Shared/constants';
import { DebouncedSearchField } from 'src/features/IAM/Shared/DebouncedSearchField/DebouncedSearchField';
import { ErrorState } from 'src/features/IAM/Shared/ErrorState/ErrorState';
import globalStyles from 'src/features/IAM/Shared/global.module.css';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { Paper } from '../../Shared/Paper/Paper';

const USER_DELEGATION_ROUTE = '/iam/users/$username/delegations';
const MIN_PAGE_SIZE = 25;

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

  if (isLoadingChildAccounts) {
    return <CircleProgress />;
  }

  if (errorChildAccounts) {
    return <ErrorState errorText={errorChildAccounts[0].reason} />;
  }

  return (
    <Paper>
      <Typography variant="h2">Account Delegations</Typography>
      <FormField labelPosition="top" style={{ padding: 0 }}>
        <FormLabel
          className={globalStyles.visuallyHidden}
          htmlFor="filter-delegations"
          slot="label"
        >
          Search Accounts
        </FormLabel>
        <DebouncedSearchField
          id="filter-delegations"
          isLoading={isFetchingChildAccounts}
          onSearch={handleSearch}
          placeholder="Search"
          style={{ padding: 0 }}
          value={company ?? ''}
        />
      </FormField>
      <Table style={{ marginTop: Spacing.S16 }}>
        <TableHead>
          <TableRow
            headerbackground="var(--token-component-table-header-nested-background)"
            headerborder
          >
            <TableHeaderCell
              onSort={() =>
                handleOrderChange('company', order === 'asc' ? 'desc' : 'asc')
              }
              sortable
              sorted={orderBy === 'company' ? order : undefined}
            >
              Account
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {childAccounts?.data.length === 0 && (
            <TableRow>
              <TableCell>
                <p style={{ textAlign: 'center', width: '100%' }}>
                  {NO_ITEMS_TO_DISPLAY_TEXT}
                </p>
              </TableCell>
            </TableRow>
          )}
          {childAccounts?.data?.map((childAccount) => (
            <TableRow key={childAccount.euuid} zebra>
              <TableCell style={{ overflowX: 'auto' }}>
                {childAccount.company}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {(childAccounts?.results ?? 0) > MIN_PAGE_SIZE && (
        <Pagination
          count={childAccounts?.results ?? 0}
          data-testid="user-delegations-table-pagination"
          onPageChange={(e: CustomEvent<number>) =>
            pagination.handlePageChange(Number(e.detail))
          }
          onPageSizeChange={(
            e: CustomEvent<{ page: number; pageSize: number }>
          ) => pagination.handlePageSizeChange(Number(e.detail.pageSize))}
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageSizes={[MIN_PAGE_SIZE, 50, 75, 100]}
        />
      )}
    </Paper>
  );
};
