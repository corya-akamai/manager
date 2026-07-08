import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useAccountUsers, useGetTfaOptionalUsersQuery } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { usePermissions } from '../hooks/usePermissions';
import { Box } from '../Shared/Box/Box';
import { TFA_ENFORCEMENT_LINK } from '../Shared/constants';
import { ErrorState } from '../Shared/ErrorState/ErrorState';
import { Link } from '../Shared/Link/Link';
import { Paper } from '../Shared/Paper/Paper';
import { StatusIcon } from '../Shared/StatusIcon/StatusIcon';
import { IAM_SETTINGS_PENDO_IDS } from './constants';

import type { AccountSettings, APIError } from '@linode/api-v4';

interface Props {
  error: APIError[] | null;
  tfaSettings: AccountSettings | undefined;
}

export const TFASection = ({ error, tfaSettings }: Props) => {
  const navigate = useNavigate();

  // TODO: Replace with the correct permissions once they are implemented.
  const { data: permissions, error: permissionsError } = usePermissions(
    'account',
    ['is_account_admin']
  );

  const { data: allUsersData } = useAccountUsers({ params: { page_size: 1 } });
  const { data: tfaOptionalUsers } = useGetTfaOptionalUsersQuery({
    page_size: 1,
  });

  if (!permissions?.is_account_admin) {
    return (
      <NotificationBanner
        text="You do not have permission to view 2FA enforcement settings."
        type="error"
      />
    );
  }

  if (permissionsError || (error && permissions?.is_account_admin)) {
    return <ErrorState />;
  }

  const isEnforced = tfaSettings?.tfa_enforced ?? false;
  const totalUsers = allUsersData?.results ?? 0;
  // Users exempt from 2FA enforcement
  const optionalUsersCount = tfaOptionalUsers?.results ?? 0;
  const enforcedUsersCount = totalUsers - optionalUsersCount;

  return (
    <Paper padding={Spacing.S24} paddingTop={Spacing.S24}>
      <h2
        style={{
          marginBottom: Spacing.S12,
          font: Typography.Heading.S,
        }}
      >
        Two-Factor Authentication Enforcement
      </h2>
      <p>
        Two-factor authentication (2FA) enforcement enables you to enforce
        two-step login for specific or all users of your account.{' '}
        <Link to={TFA_ENFORCEMENT_LINK}>Learn more.</Link>
      </p>
      <Box
        direction="row"
        style={{
          margin: `${Spacing.S16} 0`,
          alignItems: 'center',
        }}
      >
        <StatusIcon status={isEnforced ? 'active' : 'inactive'} />
        <p>
          {isEnforced ? (
            <>
              Enabled. 2FA is enforced for{' '}
              <strong>{enforcedUsersCount} out of</strong>{' '}
              <strong>{totalUsers} users</strong> of this account.
            </>
          ) : (
            'Disabled. 2FA is optional for users on this account.'
          )}
        </p>
      </Box>
      <Button
        data-pendo-id={IAM_SETTINGS_PENDO_IDS.manageTFAEnforcement}
        onClick={() => navigate({ to: '/iam/settings/tfa-enforcement' })}
        variant="secondary"
      >
        Manage 2FA Enforcement
      </Button>
    </Paper>
  );
};
