import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import { useGetIdpConfigsQuery } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { usePermissions } from '../hooks/usePermissions';
import { CircleProgress } from '../Shared/CircleProgress/CircleProgress';
import { SSO_ENFORCEMENT_LINK } from '../Shared/constants';
import { ErrorState } from '../Shared/ErrorState/ErrorState';
import { Link } from '../Shared/Link/Link';
import { Paper } from '../Shared/Paper/Paper';
import { StatusIcon } from '../Shared/StatusIcon/StatusIcon';
import { SSO_EXPIRING } from './constants';
import { getCertificateCounts, getSummaryStatus } from './SSO/utilities';

import type { IdpConfig } from '@linode/api-v4';

export const LoginSettingsLanding = () => {
  const navigate = useNavigate();

  const { data: idpConfigs, isLoading } = useGetIdpConfigsQuery();

  const { data: permissions, error: permissionsError } = usePermissions(
    'account',
    ['view_idp_config']
  );

  const idpConfig =
    idpConfigs && idpConfigs?.results > 0 ? idpConfigs.data[0] : null;

  const getStatus = (idpConfig: IdpConfig | null) => {
    if (!idpConfig || (idpConfig && !idpConfig.enabled)) {
      return 'inactive';
    }
    return 'active';
  };

  const isEnforcedForAllUsers =
    idpConfig?.enabled &&
    idpConfig.enforce &&
    idpConfig.excluded_users_count === 0;

  const certs = idpConfig?.saml?.public_certificates ?? [];
  const { activeOnlyCount, expiringCount } = getCertificateCounts(certs);
  const hasCertExpiringWarning =
    idpConfig?.enabled && activeOnlyCount === 0 && expiringCount > 0;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.view_idp_config) {
    return (
      <NotificationBanner
        text="You do not have permission to view IDP configurations."
        type="error"
      />
    );
  }

  if (permissionsError) {
    return <ErrorState />;
  }

  return (
    <Paper padding={Spacing.S24} paddingTop={Spacing.S24}>
      <h2
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S12,
          font: Typography.Heading.S,
        }}
      >
        Single Sign-On Enforcement
      </h2>
      <p style={{ margin: Spacing.S0 }}>
        The single sign-on (SSO) enforcement enables you to configure the SSO
        login for users of your account, including identity provider (IDP)
        configuration and excluded users.{' '}
        <Link to={SSO_ENFORCEMENT_LINK}>Learn more.</Link>
      </p>
      <div
        style={{
          margin: `${Spacing.S16} 0`,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <StatusIcon status={getStatus(idpConfig)} />
        <p style={{ margin: Spacing.S0 }}>{getSummaryStatus(idpConfig)}</p>
      </div>
      {isEnforcedForAllUsers && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          type="warning"
        >
          There are no excluded users. Not recommended.{' '}
          <Link to={SSO_ENFORCEMENT_LINK}>Learn more.</Link>
        </NotificationBanner>
      )}
      {hasCertExpiringWarning && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={SSO_EXPIRING}
          type="warning"
        />
      )}
      <Button
        onClick={() => navigate({ to: '/iam/settings/sso/idp-configurations' })}
        variant="secondary"
      >
        Manage SSO Enforcement
      </Button>
    </Paper>
  );
};
