import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { matchPath } from 'react-router-dom';

export const UserDetails = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const history = useHistory();

  const tabs = [
    {
      routeName: `/identity-access-management/users/name/details`,
      title: 'User Details',
    },
    {
      routeName: `/identity-access-management/users/name/roles`,
      title: 'User Roles',
    },
  ];

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
  };

  const getDefaultTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );

    return tabChoice;
  };

  let idx = 0;

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          labelOptions: {
            noCap: true,
          },
          pathname: location.pathname,
        }}
        removeCrumbX={4}
        title={username}
      />
      <Tabs index={getDefaultTabIndex()} onChange={navToURL}>
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={idx}>
            <p>user details - UIE-8137</p>
          </SafeTabPanel>
          <SafeTabPanel index={++idx}>
            <p>user roles</p>
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
