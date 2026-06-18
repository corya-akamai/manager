import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import {
  useAccountRoles,
  useAccountUsersInfiniteQuery,
  useUserRoles,
  useUserRolesMutation,
} from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import React, { useCallback, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePermissions } from '../../hooks/usePermissions';
import { Box } from '../../Shared/Box/Box';
import {
  IAM_ROLES_PENDO_IDS,
  INTERNAL_ERROR_NO_CHANGES_SAVED,
} from '../../Shared/constants';
import { DelegateUserChip } from '../../Shared/DelegateUserChip';
import { Drawer, DrawerInlineActions } from '../../Shared/Drawer';
import styles from '../../Shared/global.module.css';
import { Link } from '../../Shared/Link/Link';
import { mergeAssignedRolesIntoExistingRoles } from '../../Shared/utilities';
import { AssignSingleSelectedRole } from './AssignSingleSelectedRole';

import type { RoleView } from '../../Shared/types';
import type { AssignNewRoleFormValues } from '../../Shared/utilities';
import type { User } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  selectedRoles: RoleView[];
}

export const AssignSelectedRolesDrawer = ({
  onClose,
  onSuccess,
  open,
  selectedRoles,
}: Props) => {
  const values = {
    roles: selectedRoles.map((r) => ({
      role: {
        access: r.access,
        entity_type: r.entity_type,
        label: r.name,
        value: r.name,
      },
      entities: null,
    })),
    username: null,
  };

  const form = useForm<AssignNewRoleFormValues>({
    defaultValues: values,
    values,
  });

  const [usernameInput, setUsernameInput] = useState<string>('');
  const debouncedUsernameInput = useDebouncedValue(usernameInput);
  const username = form.watch('username');
  const userSearchFilter = debouncedUsernameInput
    ? {
        ['+or']: [
          { username: { ['+contains']: debouncedUsernameInput } },
          { email: { ['+contains']: debouncedUsernameInput } },
        ],
      }
    : undefined;

  const { data: permissions } = usePermissions('account', ['view_user']);

  const {
    data: accountUsers,
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingAccountUsers,
    isLoading: isLoadingAccountUsers,
  } = useAccountUsersInfiniteQuery(
    {
      ...userSearchFilter,
      '+order': 'asc',
      '+order_by': 'username',
    },
    permissions?.view_user
  );

  const getUserOptions = useCallback(() => {
    const users = accountUsers?.pages.flatMap((page) => page.data);
    return users?.map((user: User) => ({
      label: user.username,
      value: user.username,
      userType: user.user_type,
    }));
  }, [accountUsers]);

  const { handleSubmit, reset, control, formState, setError } = form;

  const { data: accountRoles } = useAccountRoles();

  const { data: existingRoles } = useUserRoles(username ?? '');

  const [areDetailsHidden, setAreDetailsHidden] = useState(false);

  const { mutateAsync: updateUserRoles, isPending } = useUserRolesMutation(
    username ?? ''
  );

  const onSubmit = async (values: AssignNewRoleFormValues) => {
    try {
      const mergedRoles = mergeAssignedRolesIntoExistingRoles(
        values,
        existingRoles
      );

      await updateUserRoles(mergedRoles);
      const successMessage = (
        <p>
          Roles assigned. See user&apos;s{' '}
          {<Link to={`/iam/users/${username}/roles`}>Assigned Roles</Link>} to
          review them.
        </p>
      );
      enqueueSnackbar(successMessage, {
        variant: 'success',
      });
      onSuccess();

      handleClose();
    } catch (error) {
      setError(error.field ?? 'root', {
        message: INTERNAL_ERROR_NO_CHANGES_SAVED,
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    const isAtBottom =
      Math.abs(
        listboxNode.scrollHeight -
          listboxNode.clientHeight -
          listboxNode.scrollTop
      ) < 1;

    if (isAtBottom && hasNextPage) {
      fetchNextPage();
    }
  };

  const drawerTitle = `Assign Selected Role${selectedRoles.length > 1 ? `s` : ``} to a User`;

  return (
    <Drawer
      aria-label={drawerTitle}
      className={styles.noMargin}
      onClose={handleClose}
      open={open}
    >
      <div slot="header">{drawerTitle}</div>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} slot="body">
          {formState.errors.root?.message && (
            <NotificationBanner
              text={formState.errors.root?.message}
              type="error"
            />
          )}
          <p style={{ marginBottom: Spacing.S20 }}>
            Select the user you want to assign selected roles to. Some roles
            require selecting entities they should apply to.
          </p>
          <Box
            direction="column"
            style={{
              justifyContent: 'space-between',
              marginBottom: Spacing.S20,
            }}
          >
            <h3
              style={{
                marginBottom: Spacing.S8,
                marginTop: Spacing.S0,
                font: Typography.Heading.S,
              }}
            >
              User
            </h3>

            <Controller
              control={control}
              name={`username`}
              render={({ field: { onChange, value }, fieldState }) => (
                <Autocomplete
                  data-pendo-id={
                    IAM_ROLES_PENDO_IDS.assignSelectedRolesToUserOpen
                  }
                  disablePortal={false}
                  errorText={fieldState.error?.message}
                  getOptionLabel={(option) => option.label}
                  label="Select a User"
                  loading={isLoadingAccountUsers || isFetchingAccountUsers}
                  noMarginTop
                  onChange={(_, option) => {
                    onChange(option?.label || null);
                    // Form now has the username, so we can clear the input
                    // This will prevent refetching all users with an existing user as a filter
                    setUsernameInput('');
                  }}
                  onInputChange={(_, value) => {
                    // We set an input state separately for when we query the API
                    setUsernameInput(value);
                  }}
                  options={getUserOptions() || []}
                  placeholder="Select a User"
                  renderOption={(props, option) => (
                    <li
                      {...props}
                      data-pendo-id={
                        option.userType === 'parent'
                          ? IAM_ROLES_PENDO_IDS.assignSelectedRoleToUserParent
                          : option.userType === 'child'
                            ? IAM_ROLES_PENDO_IDS.assignSelectedRoleToUserChild
                            : IAM_ROLES_PENDO_IDS.assignSelectedRoleToUserDelegate
                      }
                      key={option.value}
                    >
                      <Box
                        direction="row"
                        style={{ alignItems: 'center', gap: Spacing.S8 }}
                        wrap="nowrap"
                      >
                        <p>{option.label}</p>
                        {option.userType === 'delegate' && <DelegateUserChip />}
                      </Box>
                    </li>
                  )}
                  slotProps={{
                    listbox: {
                      onScroll: handleScroll,
                    },
                  }}
                  textFieldProps={{
                    hideLabel: true,
                    sx: {
                      '& .MuiInputBase-input': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    },
                  }}
                  value={
                    getUserOptions()?.find((o) => o.value === value) ?? null
                  }
                />
              )}
              rules={{ required: 'Select a user.' }}
            />
          </Box>

          <Box
            direction="row"
            style={{
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ font: Typography.Heading.S }}>
              Role
              {selectedRoles.length > 1 ? `s` : ``}
            </h3>
            {selectedRoles.length > 0 && (
              <Button
                onClick={() => setAreDetailsHidden(!areDetailsHidden)}
                variant="link"
              >
                {areDetailsHidden ? 'Show' : 'Hide'} details
              </Button>
            )}
          </Box>

          {!!accountRoles &&
            selectedRoles.map((role, index) => (
              <AssignSingleSelectedRole
                hideDetails={areDetailsHidden}
                index={index}
                key={role.id}
                role={role}
              />
            ))}
          <DrawerInlineActions>
            <Button
              data-testid="cancel"
              onClick={handleClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              data-pendo-id={IAM_ROLES_PENDO_IDS.assignSelectedRoleToUserAssign}
              data-testid="submit"
              processing={isPending || formState.isSubmitting}
              type="submit"
              variant="primary"
            >
              Assign
            </Button>
          </DrawerInlineActions>
        </form>
      </FormProvider>
    </Drawer>
  );
};
