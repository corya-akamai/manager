import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import UsersLanding from './Users/Users';

import type { RouteComponentProps } from 'react-router-dom';

const IdentityAccessManagementLanding = React.lazy(
  () => import('./IdentityAccessManagementLanding')
);

type CombinedProps = RouteComponentProps;

export const IdentityAccessManagement: React.FC<CombinedProps> = (props) => {
  const path = props.match.path;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Identity and Access Management" />
      <Switch>
        <Route component={IdentityAccessManagementLanding} path={`${path}`} />
        <Route component={UsersLanding} path={`${path}/users`} />
        {/* <Route
          component={RolesPermissionsLanding}
          path={`${path}/roles-permissions`}
        /> */}
      </Switch>
    </React.Suspense>
  );
};

export default IdentityAccessManagement;
