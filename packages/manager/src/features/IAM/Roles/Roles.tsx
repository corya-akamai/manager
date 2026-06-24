import { NotificationBanner } from '@akamai/cds-components/react';
import { Typography } from '@akamai/cds-tokens';
import { useAccountRoles } from '@linode/queries';
import React from 'react';

import { useDelegationRole } from '../hooks/useDelegationRole';
import { usePermissions } from '../hooks/usePermissions';
import { CircleProgress } from '../Shared/CircleProgress/CircleProgress';
import { Paper } from '../Shared/Paper/Paper';
import { mapAccountPermissionsToRoles } from '../Shared/utilities';
import { DefaultRolesPanel } from './Defaults/DefaultRolesPanel';
import { RolesTable } from './RolesTable/RolesTable';

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
        <h2 style={{ font: Typography.Heading.M }}>Roles</h2>
        <RolesTable roles={roles} />
      </Paper>
    </>
  );
};
