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
import * as React from 'react';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { ADD_CERTIFICATE_PERMISSION_ERROR } from '../../constants';
import { AddCertificateDrawer } from './AddCertificateDrawer';

interface Props {
  idpConfigId: string;
}

export const NoCertificates = ({ idpConfigId }: Props) => {
  // TODO - UIE-11305 replace with actual permissions check
  const { data: permissions } = usePermissions('account', ['is_account_admin']);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const onClick = () => setIsDrawerOpen(true);

  return (
    <>
      <ZeroErrorState>
        <ZeroErrorIcon icon="doc-no-selection" />
        <ZeroErrorTitle>This list is empty</ZeroErrorTitle>
        <ZeroErrorDescription style={{ maxWidth: 320 }}>
          {`There are no certificates added yet. Once you add one, it will show up here.`}
        </ZeroErrorDescription>
        <ZeroErrorActions>
          <Tooltip
            disabled={permissions?.is_account_admin}
            tooltipPlacement="bottom"
            tooltipText={ADD_CERTIFICATE_PERMISSION_ERROR}
          >
            <Button
              disabled={!permissions?.is_account_admin}
              onClick={onClick}
              variant="primary"
            >
              Add Certificate
              {!permissions?.is_account_admin && (
                <Icon icon="info-outline" size="m" />
              )}
            </Button>
          </Tooltip>
        </ZeroErrorActions>
      </ZeroErrorState>

      <AddCertificateDrawer
        idpConfigId={idpConfigId}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      />
    </>
  );
};
