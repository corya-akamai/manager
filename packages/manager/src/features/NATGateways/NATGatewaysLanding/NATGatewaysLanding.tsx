import { Notice } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

export const NATGatewaysLanding = () => {
  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: 'NAT Gateways',
          removeCrumbX: 1,
        }}
        spacingBottom={16}
        title="NAT Gateways"
      />
      <Notice variant="info">NAT Gateways is coming soon...</Notice>
    </>
  );
};
