import { SplashScreen } from '@linode/ui';
import React, { useEffect } from 'react';

import { logout } from 'src/OAuth/oauth';

export const Logout = () => {
  useEffect(() => {
    logout();
  }, []);

  return <SplashScreen />;
};
