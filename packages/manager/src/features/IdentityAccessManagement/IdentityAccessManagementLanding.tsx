import * as React from 'react';
import { matchPath } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import type { RouteComponentProps } from 'react-router-dom';
type Props = RouteComponentProps<{}>;

import UsersLanding from 'src/features/IdentityAccessManagement/Users/Users';

const IdentityAccessManagementLanding = React.memo((props: Props) => {
  const tabs = [
    {
      routeName: `${props.match.url}/users`,
      title: 'Users',
    },
    {
      routeName: `${props.match.url}/roles-permissions`,
      title: 'Roles & Permissions',
    },
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  return (
    <>
      <DocumentTitleSegment segment="Identity and Access Management" />
      <LandingHeader
        breadcrumbProps={{ pathname: '/identity-access-management' }}
        docsLink="https://www.linode.com/docs/platform/identity-access-management/"
        entity="Identity and Access Management"
        title="Identity and Access Management"
      />
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <h3>Users tab</h3>
              <UsersLanding {...props} />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <h3>Roles & Permissions tab</h3>
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
});

export default IdentityAccessManagementLanding;
