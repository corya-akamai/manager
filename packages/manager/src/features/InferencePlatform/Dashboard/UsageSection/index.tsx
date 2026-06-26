import { Box, Paper, Select, Stack, Typography } from '@linode/ui';
import React from 'react';

import { StackedBarChart } from 'src/components/StackedBarChart';

import tokenUsageData from '../TokenUsageData.json';
import { filterChartPayloadBySeries } from './chartUtils';
import { DynamicChartUpdate } from './DynamicChartUpdate';

interface UsageSectionProps {
  /**
   * When true, the chart data updates dynamically at regular intervals.
   * When false, the chart displays static data without updates.
   * @default true
   */
  doDynamicData?: boolean;
}

export const UsageSection = ({ doDynamicData = true }: UsageSectionProps) => {
  const transformedData = React.useMemo(() => {
    return {
      series: tokenUsageData.series.map((series) => ({
        id: series.seriesName,
        label: series.seriesName,
        values: series.values.map((point) => ({
          date: point.date,
          time: point.time,
          value: point.value,
        })),
      })),
    };
  }, []);

  // Map each series ID to its position in the array (for consistent colors)
  const seriesColorIndices = React.useMemo(() => {
    const indices: Record<string, number> = {};
    transformedData.series.forEach((series, index) => {
      indices[series.id] = index;
    });
    return indices;
  }, [transformedData.series]);

  const seriesOptions = React.useMemo(() => {
    return [
      { label: 'All series', value: 'all' },
      ...transformedData.series.map((series) => ({
        label: series.label,
        value: series.id,
      })),
    ];
  }, [transformedData]);

  const [selectedSeriesId, setSelectedSeriesId] = React.useState(
    seriesOptions[0]
  );

  return (
    <Paper
      sx={{ border: 'none', borderRadius: 0, p: 0, mb: 2 }}
      variant="outlined"
    >
      <Paper
        sx={{
          border: 'none',
          borderRadius: 0,
          mt: 0,
          padding: '20px 26px 24px 6px',
        }}
      >
        <Stack
          alignContent="flex-start"
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          sx={{
            "& [data-testid='inputLabelWrapper']": {
              display: 'none',
            },
            mb: 1,
            padding: '0px 0px 16px 14px',
          }}
        >
          <Typography variant="h3">Usage - Tokens</Typography>

          <Box
            sx={{
              minWidth: 220,
              mb: 0,
            }}
          >
            <Select
              label=""
              onChange={(_, option) => {
                if (option) {
                  setSelectedSeriesId(
                    option as { label: string; value: string }
                  );
                }
              }}
              options={seriesOptions}
              sx={{ margins: 0, padding: 0 }}
              value={selectedSeriesId}
            />
          </Box>
        </Stack>

        {doDynamicData ? (
          <DynamicChartUpdate
            barWidth={16}
            chartComponent={StackedBarChart}
            data={transformedData}
            selectedSeriesId={selectedSeriesId.value}
            seriesColorIndices={seriesColorIndices}
            stacked={true}
            updateIntervalMs={5000}
          />
        ) : (
          <StackedBarChart
            data={filterChartPayloadBySeries(
              transformedData,
              selectedSeriesId.value
            )}
            seriesColorIndices={seriesColorIndices}
            stacked={true}
          />
        )}
      </Paper>
    </Paper>
  );
};
