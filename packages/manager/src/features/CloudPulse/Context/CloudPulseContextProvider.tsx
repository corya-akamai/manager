import * as React from 'react';

import { CloudPulseContext } from './CloudPulseContext';

import type { FilterData } from '../Dashboard/CloudPulseDashboardLanding';
import type { PdfData } from '../Dashboard/pdf/types';
import type { Dashboard } from '@linode/api-v4';

interface CloudPulseProviderProps {
  /**
   * The children of the provider, which will have access to the CloudPulse context
   */
  children: React.ReactNode;
}

export const CloudPulseContextProvider = ({
  children,
}: CloudPulseProviderProps) => {
  const globalFilterData = React.useRef<FilterData | undefined>(undefined);
  const globalSelectedDashboard = React.useRef<Dashboard | undefined>(
    undefined
  );
  const globalGroupBy = React.useRef<string[]>([]);
  const pdfData = React.useRef<Map<string, PdfData>>(undefined);
  const loadingWidgets = React.useRef<Set<string>>(new Set());
  const [isAnyWidgetLoading, setIsAnyWidgetLoading] = React.useState(false);

  const setGlobalFilterData = React.useCallback((filterData: FilterData) => {
    globalFilterData.current = filterData;
  }, []);

  const getGlobalFilterData = React.useCallback(() => {
    return globalFilterData.current;
  }, []);

  const setGlobalSelectedDashboard = React.useCallback(
    (dashboard: Dashboard) => {
      // Placeholder for potential future use if we need to register dashboard-level data
      globalSelectedDashboard.current = dashboard;
    },
    []
  );

  const getGlobalSelectedDashboard = React.useCallback(() => {
    return globalSelectedDashboard.current;
  }, []);

  const setGlobalGroupBy = React.useCallback((groupBy: string[]) => {
    globalGroupBy.current = groupBy;
  }, []);

  const getGlobalGroupBy = React.useCallback(() => {
    return globalGroupBy.current;
  }, []);

  const setDashboardPdfData = React.useCallback((data: PdfData) => {
    if (data?.widgetLabel) {
      if (!pdfData.current) {
        pdfData.current = new Map<string, PdfData>();
      }
      pdfData.current.set(data.widgetLabel, data);
    }
  }, []);

  const setWidgetLoading = React.useCallback(
    (widgetLabel: string, isLoading: boolean) => {
      if (isLoading) {
        loadingWidgets.current.add(widgetLabel);
      } else {
        loadingWidgets.current.delete(widgetLabel);
      }

      setIsAnyWidgetLoading(loadingWidgets.current.size > 0);
    },
    []
  );

  // Reflects whether any widget is still loading its metrics. Consumers use this
  // to disable the download button until every widget has finished loading.
  const getIsWidgetLoading = React.useCallback(() => {
    return isAnyWidgetLoading;
  }, [isAnyWidgetLoading]);

  return (
    <CloudPulseContext.Provider
      value={{
        setGlobalFilterData,
        getGlobalFilterData,
        setGlobalSelectedDashboard,
        getGlobalSelectedDashboard,
        setGlobalGroupBy,
        getGlobalGroupBy,
        setDashboardPdfData,
        setWidgetLoading,
        getIsWidgetLoading,
      }}
    >
      {children}
    </CloudPulseContext.Provider>
  );
};
