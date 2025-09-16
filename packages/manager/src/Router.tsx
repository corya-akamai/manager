import { useAccountSettings } from '@linode/queries';
import { useQueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useGlobalErrors } from 'src/hooks/useGlobalErrors';

import { ErrorBoundaryFallback } from './features/ErrorBoundary/ErrorBoundaryFallback';
import { router } from './routes';

export const Router = () => {
  const queryClient = useQueryClient();
  const globalErrors = useGlobalErrors();

  const { data: accountSettings } = useAccountSettings();
  // const { isDatabasesEnabled } = useIsDatabasesEnabled();
  // const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  // const { isACLPEnabled } = useIsACLPEnabled();
  const flags = useFlags();

  // Update the router's context
  router.update({
    context: {
      accountSettings,
      flags,
      globalErrors,
      // isACLPEnabled,
      // isDatabasesEnabled,
      // isPlacementGroupsEnabled,
      queryClient,
    },
  });

  return (
    <ErrorBoundaryFallback>
      <RouterProvider router={router} />
    </ErrorBoundaryFallback>
  );
};
