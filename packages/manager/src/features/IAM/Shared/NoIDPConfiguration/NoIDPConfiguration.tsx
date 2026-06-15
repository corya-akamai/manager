import {
  Button,
  Icon,
  Tooltip,
  ZeroErrorActions,
  ZeroErrorDescription,
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import { useLocation } from '@tanstack/react-router';
import * as React from 'react';

import { IdpConfigurationDrawer } from '../../LoginSettings/SSO/IdpConfigurations/IdpConfigurationDrawer';

interface Props {
  permissions: Record<'create_idp_config', boolean> | undefined;
}

export const NoIDPConfiguration = ({ permissions }: Props) => {
  const location = useLocation();

  const isOnIDPConfigurationsPage = location.pathname.includes(
    '/idp-configurations'
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const onClick = () => {
    setIsDrawerOpen(true);
  };

  return (
    <>
      <ZeroErrorState>
        <ZeroErrorIcon icon="doc-no-selection" />
        <ZeroErrorTitle>No data to display</ZeroErrorTitle>
        <ZeroErrorDescription
          style={{ maxWidth: isOnIDPConfigurationsPage ? 260 : 320 }}
        >
          {`Once you create the IDP configuration, ${isOnIDPConfigurationsPage ? 'it will show up here.' : 'you’ll be able to manage its enforcement here.'}`}
        </ZeroErrorDescription>
        <ZeroErrorActions>
          <Tooltip
            disabled={permissions?.create_idp_config}
            tooltipPlacement="bottom"
            tooltipText="You do not have permission to create IDP configuration."
          >
            <Button
              disabled={!permissions?.create_idp_config}
              onClick={onClick}
              variant="primary"
            >
              Create IDP Configuration
              {!permissions?.create_idp_config && (
                <Icon icon="info-outline" size="m" />
              )}
            </Button>
          </Tooltip>
        </ZeroErrorActions>
      </ZeroErrorState>
      <IdpConfigurationDrawer
        mode="create"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      />
    </>
  );
};
