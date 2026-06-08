import { NotificationBanner } from '@akamai/cds-components/react';
import { useAccountRoles } from '@linode/queries';
import { Typography } from '@linode/ui';
import React from 'react';

import { RolesTable } from 'src/features/IAM/Roles/RolesTable/RolesTable';
import { CircleProgress } from 'src/features/IAM/Shared/CircleProgress/CircleProgress';
import { mapAccountPermissionsToRoles } from 'src/features/IAM/Shared/utilities';

import { useDelegationRole } from '../hooks/useDelegationRole';
import { usePermissions } from '../hooks/usePermissions';
import { Paper } from '../Shared/Paper/Paper';
import { DefaultRolesPanel } from './Defaults/DefaultRolesPanel';

export const RolesLanding = () => {
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'account',
    ['list_role_permissions']
  );
  const { data: accountRoles, isLoading } = useAccountRoles(
    permissions?.list_role_permissions
  );
  const { isChildUserType, isProfileLoading, isDelegateUserType } =
    useDelegationRole();

  const { roles } = React.useMemo(() => {
    if (!accountRoles) {
      return { roles: [] };
    }
    const roles = mapAccountPermissionsToRoles(accountRoles);
    return { roles };
  }, [accountRoles]);

  if (isLoading || isPermissionsLoading || isProfileLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.list_role_permissions) {
    return (
      <NotificationBanner
        text="You do not have permission to view roles."
        type="error"
      />
    );
  }

  return (
    <>
      {(isChildUserType || isDelegateUserType) && <DefaultRolesPanel />}
      <Paper>
        <Typography variant="h2">Roles</Typography>
        <RolesTable roles={roles} />
      </Paper>
    </>
  );
};
