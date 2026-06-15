import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Tab,
  Tabs,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { useDelegationRole } from './hooks/useDelegationRole';
import { useFlags } from './hooks/useFlags';
import { useIsIAMEnabled } from './hooks/useIsIAMEnabled';
import { useIsIAMFederationEnabled } from './hooks/useIsIAMFederationEnabled';
import { useTabs } from './hooks/useTabs';
import { IAM_DOCS_LINK, ROLES_LEARN_MORE_LINK } from './Shared/constants';
import { DocsLink } from './Shared/DocsLink/DocsLink';
import { LandingHeader } from './Shared/LandingHeader/LandingHeader';
import { SuspenseLoader } from './Shared/SuspenseLoader/SuspenseLoader';

import type { TabsElement } from '@akamai/cds-components/react';

export const IdentityAccessLanding = React.memo(() => {
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();
  const showNewBadge = flags.iamNewBadge && isIAMEnabled;
  const location = useLocation();
  const navigate = useNavigate();
  const { isParentUserType } = useDelegationRole();
  const { isIAMFederationEnabled } = useIsIAMFederationEnabled();
  const tabsRef = React.useRef<TabsElement>(null);

  const { tabs, tabIndex, handleTabChange } = useTabs(
    [
      {
        to: `/iam/users`,
        title: 'Users',
      },
      {
        to: `/iam/roles`,
        title: 'Roles',
      },
      {
        hide: !isParentUserType,
        to: `/iam/delegations`,
        title: 'Account Delegations',
      },
      {
        hide: !isIAMFederationEnabled,
        to: `/iam/settings`,
        title: 'Settings',
      },
    ],
    tabsRef
  );

  if (location.pathname === '/iam') {
    navigate({ to: '/iam/users', replace: true });
  }

  return (
    <>
      <LandingHeader spacingBottom={Spacing.S4}>
        <Breadcrumb>
          <BreadcrumbItem>
            Identity and Access
            {showNewBadge ? <Badge type="new">New</Badge> : null}
          </BreadcrumbItem>
        </Breadcrumb>
        <DocsLink
          href={tabIndex === 0 ? IAM_DOCS_LINK : ROLES_LEARN_MORE_LINK}
        />
      </LandingHeader>
      <div style={{ overflowX: 'auto' }}>
        <Tabs
          border={false}
          onTabsChange={(e) => handleTabChange(e.detail.index)}
          ref={tabsRef}
          tabMaxWidth={250}
        >
          {tabs.map((tab, i) => (
            <Tab
              active={i === tabIndex || undefined}
              key={String(tab.to)}
              label={tab.title}
            >
              <span slot="tab-header">{tab.title}</span>
            </Tab>
          ))}
        </Tabs>
      </div>
      <React.Suspense fallback={<SuspenseLoader />}>
        <Outlet />
      </React.Suspense>
    </>
  );
});
