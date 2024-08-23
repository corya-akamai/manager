import { Box } from '@mui/material';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { DatabaseEmptyState } from 'src/features/Databases/DatabaseLanding/DatabaseEmptyState';
import DatabaseLandingTable from 'src/features/Databases/DatabaseLanding/DatabaseLandingTable';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { DatabaseClusterInfoBanner } from 'src/features/GlobalNotifications/DatabaseClusterInfoBanner';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import {
  useDatabaseTypesQuery,
  useDatabasesQuery,
} from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const preferenceKey = 'databases';

const DatabaseLanding = () => {
  const history = useHistory();
  const aDatabasesPagination = usePagination(1, preferenceKey, 'a');
  const bDatabasesPagination = usePagination(1, preferenceKey, 'b');

  const { data: types, isLoading: isTypeLoading } = useDatabaseTypesQuery();
  const { isDatabasesV2Enabled } = useIsDatabasesEnabled();

  const {
    handleOrderChange: aDatabaseHandleOrderChange,
    order: aDatabaseOrder,
    orderBy: aDatabaseOrderBy,
  } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `a-${preferenceKey}-order`
  );

  const aDatabasesFilter = {
    ['+contains']: 'adb20',
    ['+order']: aDatabaseOrder,
    ['+order_by']: aDatabaseOrderBy,
  };

  const {
    data: aDatabases,
    error: aDatabasesError,
    isLoading: aDatabasesIsLoading,
  } = useDatabasesQuery(
    {
      page: aDatabasesPagination.page,
      page_size: aDatabasesPagination.pageSize,
    },
    aDatabasesFilter
  );

  const {
    handleOrderChange: bDatabaseHandleOrderChange,
    order: bDatabaseOrder,
    orderBy: bDatabaseOrderBy,
  } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `b-${preferenceKey}-order`
  );

  const bDatabasesFilter = {
    ['+contains']: 'adb10',
    ['+order']: bDatabaseOrder,
    ['+order_by']: bDatabaseOrderBy,
  };

  const {
    data: bDatabases,
    error: bDatabasesError,
    isLoading: bDatabasesIsLoading,
  } = useDatabasesQuery(
    {
      page: bDatabasesPagination.page,
      page_size: bDatabasesPagination.pageSize,
    },
    bDatabasesFilter
  );

  const error = aDatabasesError || bDatabasesError;
  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your databases.')[0].reason
        }
      />
    );
  }

  if (aDatabasesIsLoading || bDatabasesIsLoading || isTypeLoading) {
    return <CircleProgress />;
  }

  const showTabs = isDatabasesV2Enabled && bDatabases.data.length !== 0;

  const showEmpty =
    aDatabases.data.length === 0 && bDatabases.data.length === 0;

  if (showEmpty) {
    return <DatabaseEmptyState />;
  }

  return (
    <React.Fragment>
      <LandingHeader
        createButtonText="Create Database Cluster"
        docsLink="https://www.linode.com/docs/products/databases/managed-databases/"
        onButtonClick={() => history.push('/databases/create')}
        title="Database Clusters"
      />
      {showTabs && <DatabaseClusterInfoBanner />}
      <Box sx={{ marginTop: '15px' }}>
        {showTabs ? (
          <Tabs>
            <TabList>
              <Tab>Legacy Database Clusters</Tab>
              <Tab>New Database Clusters</Tab>
            </TabList>
            <TabPanels>
              <SafeTabPanel index={0}>
                <DatabaseLandingTable
                  data={bDatabases.data}
                  handleOrderChange={bDatabaseHandleOrderChange}
                  order={bDatabaseOrder}
                  orderBy={bDatabaseOrderBy}
                  types={types}
                />
              </SafeTabPanel>
              <SafeTabPanel index={1}>
                <DatabaseLandingTable
                  data={aDatabases.data}
                  handleOrderChange={aDatabaseHandleOrderChange}
                  isADatabases={true}
                  order={aDatabaseOrder}
                  orderBy={aDatabaseOrderBy}
                  types={types}
                />
              </SafeTabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <DatabaseLandingTable
            handleOrderChange={
              isDatabasesV2Enabled
                ? aDatabaseHandleOrderChange
                : bDatabaseHandleOrderChange
            }
            data={isDatabasesV2Enabled ? aDatabases.data : bDatabases.data}
            isADatabases={isDatabasesV2Enabled}
            order={isDatabasesV2Enabled ? aDatabaseOrder : bDatabaseOrder}
            orderBy={isDatabasesV2Enabled ? aDatabaseOrderBy : bDatabaseOrderBy}
            types={types}
          />
        )}
      </Box>
    </React.Fragment>
  );
};

export default React.memo(DatabaseLanding);
