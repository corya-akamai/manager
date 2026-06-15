import { Spacing } from '@akamai/cds-tokens';
import { sortByString } from '@akamai/compute-ui-core/formatting';
import { Typography } from '@linode/ui';
import * as React from 'react';

import { Box } from '../Box/Box';
import { TruncatedList } from '../TruncatedList/TruncatedList';
import { StyledPermissionItem, StyledTitle } from './Permissions.style';

import type { PermissionType } from '@linode/api-v4/lib/iam/types';

type Props = {
  noPermissionsMessage?: string;
  permissions: PermissionType[];
};

export const Permissions = React.memo(({ permissions }: Props) => {
  const sortedPermissions = permissions.sort((a, b) => {
    return sortByString(a, b, 'asc');
  });

  return (
    <Box data-testid="parent" direction="column">
      <StyledTitle>Permissions</StyledTitle>
      {!permissions.length ? (
        <Typography>
          This role doesn’t include permissions. Refer to the role description
          to understand what access is granted by this role.
        </Typography>
      ) : (
        <TruncatedList
          dataTestId="container"
          listContainerStyle={{ marginLeft: `-${Spacing.S6}` }}
        >
          {sortedPermissions.map((permission: PermissionType) => (
            <StyledPermissionItem data-testid="permission" key={permission}>
              {permission}
            </StyledPermissionItem>
          ))}
        </TruncatedList>
      )}
    </Box>
  );
});
