import {
  Pagination,
  Select,
  Table,
  TableBody,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  useGetDefaultDelegationAccessQuery,
  useUserRoles,
} from '@linode/queries';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PAGE_SIZES } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useAllAccountEntities } from 'src/queries/entities/entities';

import { useIsDefaultDelegationRolesForChildAccount } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import {
  addEntityNamesToRoles,
  getSearchableFields,
} from '../../Users/UserEntities/utils';
import { Box } from '../Box/Box';
import { ENTITIES_TABLE_PREFERENCE_KEY } from '../constants';
import { RemoveAssignmentConfirmationDialog } from '../RemoveAssignmentConfirmationDialog/RemoveAssignmentConfirmationDialog';
import {
  getFilteredRoles,
  groupAccountEntitiesByType,
  mapEntityTypesForSelect,
} from '../utilities';
import { AssignedEntitiesTableBody } from './AssignedEntitiesTableBody';
import { AssignedEntitiesTableHead } from './AssignedEntitiesTableHead';
import { ChangeRoleForEntityDrawer } from './ChangeRoleForEntityDrawer';

import type { DrawerModes, EntitiesRole } from '../types';
import type { EntityType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

const ALL_ENTITIES_OPTION: SelectOption = {
  label: 'All Entities',
  value: 'all',
};

type SortOrder = 'asc' | 'desc';

type OrderByKeys = 'entity_name' | 'entity_type' | 'role_name';

interface Props {
  username?: string;
}

const DEFAULTS_ENTITIES_URL = '/iam/roles/defaults/entity-access';
const USER_ENTITIES_URL = '/iam/users/$username/entities';
const MIN_PAGE_SIZE = 25;

export const AssignedEntitiesTable = ({ username }: Props) => {
  const { data: permissions } = usePermissions('account', [
    'is_account_admin',
    'update_default_delegate_access',
    'list_entities',
  ]);
  const navigate = useNavigate();

  const { isDefaultDelegationRolesForChildAccount } =
    useIsDefaultDelegationRolesForChildAccount();

  const {
    query: queryParam,
    entityType: entityTypeParam,
    order: orderParam,
    selectedRole: selectedRoleSearchParam,
    orderBy: orderByParam,
  } = useSearch({
    from: isDefaultDelegationRolesForChildAccount
      ? DEFAULTS_ENTITIES_URL
      : USER_ENTITIES_URL,
  });

  const order: SortOrder = orderParam ?? 'asc';

  const ORDERABLE_KEYS = ['entity_name', 'entity_type', 'role_name'] as const;
  const isValidOrderBy = (v: unknown): v is OrderByKeys =>
    ORDERABLE_KEYS.includes(v as OrderByKeys);
  const orderBy: OrderByKeys = isValidOrderBy(orderByParam)
    ? orderByParam
    : 'entity_name';

  const handleOrderChange = (key: string, order?: SortOrder | undefined) => {
    navigate({
      to: isDefaultDelegationRolesForChildAccount
        ? DEFAULTS_ENTITIES_URL
        : USER_ENTITIES_URL,
      params: isDefaultDelegationRolesForChildAccount
        ? undefined
        : { username: username || '' },
      search: (prev) => ({
        ...prev,
        order,
        orderBy: key,
      }),
    });
  };

  const appliedQuery = queryParam ?? selectedRoleSearchParam ?? '';

  const [drawerMode, setDrawerMode] =
    React.useState<DrawerModes>('assign-role');

  const [isChangeRoleForEntityDrawerOpen, setIsChangeRoleForEntityDrawerOpen] =
    React.useState<boolean>(false);
  const [selectedRole, setSelectedRole] = React.useState<EntitiesRole>();

  const {
    data: entities,
    error: entitiesError,
    isLoading: entitiesLoading,
  } = useAllAccountEntities({
    enabled: permissions?.list_entities,
  });

  const {
    data: assignedUserRoles,
    error: assignedUserRolesError,
    isLoading: assignedUserRolesLoading,
  } = useUserRoles(username ?? '', !isDefaultDelegationRolesForChildAccount);

  const {
    data: delegateDefaultRoles,
    error: delegateDefaultRolesError,
    isLoading: delegateDefaultRolesLoading,
  } = useGetDefaultDelegationAccessQuery({
    enabled: isDefaultDelegationRolesForChildAccount,
  });

  const assignedRoles = isDefaultDelegationRolesForChildAccount
    ? delegateDefaultRoles
    : assignedUserRoles;

  const error = isDefaultDelegationRolesForChildAccount
    ? delegateDefaultRolesError
    : assignedUserRolesError;

  const loading = isDefaultDelegationRolesForChildAccount
    ? delegateDefaultRolesLoading
    : assignedUserRolesLoading;

  const { filterableOptions, roles } = React.useMemo(() => {
    if (!assignedRoles || !entities) {
      return { filterableOptions: [], roles: [] };
    }
    const transformedEntities = groupAccountEntitiesByType(entities);

    const roles = addEntityNamesToRoles(assignedRoles, transformedEntities);

    const filterableOptions = [
      ALL_ENTITIES_OPTION,
      ...mapEntityTypesForSelect(roles, 's'),
    ];

    return { filterableOptions, roles };
  }, [assignedRoles, entities]);

  const selectedEntityTypeOption = React.useMemo<null | SelectOption>(() => {
    const value = entityTypeParam ?? ALL_ENTITIES_OPTION.value;
    return (
      filterableOptions.find((opt) => opt.value === value) ||
      ALL_ENTITIES_OPTION
    );
  }, [filterableOptions, entityTypeParam]);

  const handleChangeRole = (role: EntitiesRole) => {
    setIsChangeRoleForEntityDrawerOpen(true);
    setSelectedRole(role);
    setDrawerMode('change-role-for-entity');
  };
  const [isRemoveAssignmentDialogOpen, setIsRemoveAssignmentDialogOpen] =
    React.useState<boolean>(false);

  const handleRemoveAssignment = (role: EntitiesRole) => {
    setIsRemoveAssignmentDialogOpen(true);
    setSelectedRole(role);
  };

  /**
   * Closes the appropriate assignment-related dialog and adjusts pagination if needed.
   *
   * @param drawerMode Optional mode indicating which dialog should be closed.
   */
  const handleDialogClose = (drawerMode?: DrawerModes) => {
    if (drawerMode && drawerMode === 'change-role-for-entity') {
      setIsChangeRoleForEntityDrawerOpen(false);
    } else {
      setIsRemoveAssignmentDialogOpen(false);
    }
  };

  const filteredRoles = getFilteredRoles({
    entityType: entityTypeParam ?? 'all',
    getSearchableFields,
    query: appliedQuery,
    roles,
  }) as EntitiesRole[];

  const filteredAndSortedRoles = [...filteredRoles].sort((a, b) => {
    const aValue = a[orderBy]?.toLowerCase();
    const bValue = b[orderBy]?.toLowerCase();

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const pagination = usePaginationV2({
    currentRoute: isDefaultDelegationRolesForChildAccount
      ? DEFAULTS_ENTITIES_URL
      : USER_ENTITIES_URL,
    initialPage: 1,
    preferenceKey: ENTITIES_TABLE_PREFERENCE_KEY,
    clientSidePaginationData: filteredAndSortedRoles,
  });

  const filteredAndSortedRolesCount = React.useMemo(() => {
    return filteredAndSortedRoles.length;
  }, [filteredAndSortedRoles]);

  return (
    <>
      <Box
        direction="row"
        spacing={1}
        style={{
          justifyContent: 'flex-start',
          marginBottom: Spacing.S12,
        }}
      >
        <DebouncedSearchTextField
          clearable
          containerProps={{
            sx: {
              marginRight: { md: 1, xs: 0 },
              width: { md: '416px', xs: '100%' },
            },
          }}
          debounceTime={250}
          hideLabel
          label="Filter"
          onSearch={(value) => {
            navigate({
              to: isDefaultDelegationRolesForChildAccount
                ? DEFAULTS_ENTITIES_URL
                : USER_ENTITIES_URL,
              params:
                isDefaultDelegationRolesForChildAccount && !username
                  ? undefined
                  : username,
              search: (prev) => ({
                ...prev,
                page: 1,
                query: value !== '' ? value : undefined,
              }),
            });
          }}
          placeholder="Search"
          sx={{ height: 34 }}
          value={appliedQuery}
        />
        <Select
          items={filterableOptions}
          onChange={(event) => {
            const selected = event.detail as unknown as null | SelectOption;
            const nextEntityType = (selected?.value ??
              ALL_ENTITIES_OPTION.value) as 'all' | EntityType;

            navigate({
              to: isDefaultDelegationRolesForChildAccount
                ? DEFAULTS_ENTITIES_URL
                : USER_ENTITIES_URL,
              params:
                isDefaultDelegationRolesForChildAccount && !username
                  ? undefined
                  : username,
              search: (prev) => ({
                ...prev,
                page: 1,
                entityType: nextEntityType,
              }),
            });
          }}
          placeholder="All Entities"
          selected={selectedEntityTypeOption}
          style={{ maxWidth: 250 }}
          valueFn={(item) => (item as SelectOption).label}
        />
      </Box>
      <Table aria-label="Assigned Entities">
        <AssignedEntitiesTableHead
          handleOrderChange={handleOrderChange}
          order={order}
          orderBy={orderBy}
        />
        <TableBody>
          <AssignedEntitiesTableBody
            assignedRoles={assignedRoles}
            entities={entities}
            entitiesError={entitiesError}
            entitiesLoading={entitiesLoading}
            error={error}
            filteredRoles={filteredRoles}
            handleChangeRole={handleChangeRole}
            handleRemoveAssignment={handleRemoveAssignment}
            loading={loading}
            paginatedData={pagination.paginatedData}
            permissions={permissions}
          />
        </TableBody>
      </Table>
      <ChangeRoleForEntityDrawer
        mode={drawerMode}
        onClose={() => handleDialogClose(drawerMode)}
        open={isChangeRoleForEntityDrawerOpen}
        role={selectedRole}
        username={username}
      />
      <RemoveAssignmentConfirmationDialog
        onClose={() => handleDialogClose()}
        open={isRemoveAssignmentDialogOpen}
        role={selectedRole}
        username={username}
      />
      {filteredAndSortedRolesCount > PAGE_SIZES[0] && (
        <Pagination
          count={filteredAndSortedRolesCount}
          onPageChange={(e: CustomEvent<number>) =>
            pagination.handlePageChange(Number(e.detail))
          }
          onPageSizeChange={(
            e: CustomEvent<{ page: number; pageSize: number }>
          ) => pagination.handlePageSizeChange(Number(e.detail.pageSize))}
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageSizes={[MIN_PAGE_SIZE, 50, 75, 100]}
          style={{ borderBottom: 0 }}
        />
      )}
    </>
  );
};
