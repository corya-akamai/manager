import { Button } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { Box } from '../../Shared/Box/Box';
import { IAM_ROLES_PENDO_IDS } from '../../Shared/constants';
import { Paper } from '../../Shared/Paper/Paper';

export const DefaultRolesPanel = () => {
  const navigate = useNavigate();

  return (
    <Paper marginBottom={Spacing.S16}>
      <Box
        direction="row"
        spacing={Spacing.S16}
        style={{ justifyContent: 'space-between' }}
      >
        <div>
          <Typography variant="h2">Default Roles for Delegate Users</Typography>
          <Typography marginTop={2}>
            View and manage roles to be assigned to new delegate users by
            default.
          </Typography>
        </div>
        <div>
          <Button
            data-pendo-id={IAM_ROLES_PENDO_IDS.viewDefaultRoles}
            onClick={() => navigate({ to: '/iam/roles/defaults/roles' })}
            variant="secondary"
          >
            View Default Roles
          </Button>
        </div>
      </Box>
    </Paper>
  );
};
