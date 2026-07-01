import React from 'react';

import { AccessKeyDrawer } from './AccessKeyDrawer';
import { useAccessKeyDrawers } from './hooks/useAccessKeyDrawers';
import { HostNamesDrawer } from './HostNamesDrawer';
import { ViewPermissionsDrawer } from './ViewPermissionsDrawer';

export const AccessKeysDrawerOutlet = () => {
  const { drawer, closeDrawer } = useAccessKeyDrawers();

  return (
    <>
      <AccessKeyDrawer
        isOpen={drawer?.type === 'create-access-key'}
        mode="creating"
        onClose={closeDrawer}
      />

      <AccessKeyDrawer
        accessKeyId={drawer?.accessKeyId}
        isOpen={drawer?.type === 'edit-access-key'}
        mode="editing"
        onClose={closeDrawer}
      />

      <ViewPermissionsDrawer
        accessKeyId={drawer?.accessKeyId}
        isOpen={drawer?.type === 'access-key-permissions'}
        onClose={closeDrawer}
      />

      <HostNamesDrawer
        accessKeyId={drawer?.accessKeyId}
        isOpen={drawer?.type === 'access-key-hostnames'}
        onClose={closeDrawer}
      />
    </>
  );
};
