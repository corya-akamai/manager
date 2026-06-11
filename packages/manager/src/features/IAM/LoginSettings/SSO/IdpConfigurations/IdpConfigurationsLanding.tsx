import { useGetIdpConfigsQuery } from '@linode/queries';
import * as React from 'react';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { CircleProgress } from 'src/features/IAM/Shared/CircleProgress/CircleProgress';
import { DocumentTitleSegment } from 'src/features/IAM/Shared/DocumentTitleSegment/DocumentTitleSegment';
import { ErrorState } from 'src/features/IAM/Shared/ErrorState/ErrorState';
import { NoIDPConfiguration } from 'src/features/IAM/Shared/NoIDPConfiguration/NoIDPConfiguration';

import { IdpConfigurations } from './IdpConfigurations';

export const IdpConfigurationsLanding = () => {
  // TODO - UIE-11305 replace with actual permissions check for creating IDP configurations
  const { data: permissions, error: permissionsError } = usePermissions(
    'account',
    ['is_account_admin']
  );
  const { data, error, isLoading } = useGetIdpConfigsQuery();

  const hasIdpConfig = data && data.results > 0;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error || permissionsError) {
    return <ErrorState />;
  }

  return (
    <>
      <DocumentTitleSegment segment="IDP Configuration" />
      {hasIdpConfig ? (
        <IdpConfigurations idpConfig={data?.data[0]} />
      ) : (
        <NoIDPConfiguration permissions={permissions} />
      )}
    </>
  );
};
