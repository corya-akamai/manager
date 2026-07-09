import type { ChartPayload } from '../Dashboard/UsageSection/chartUtils';
import type { InferenceUsage } from '@linode/api-v4';

/**
 * The type of data to extract from usage time series entries.
 */
export type UsageDataType = 'input' | 'output' | 'request' | 'total';

/**
 * Result of transforming API data to all chart payloads in a single pass.
 */
export interface TransformedUsageData {
  input: ChartPayload;
  output: ChartPayload;
  request: ChartPayload;
  total: ChartPayload;
}

const noDataPayload = (): ChartPayload => ({
  series: [
    { id: 'no-data', label: 'No Data', values: [{ time: '00:00', value: 1 }] },
  ],
});

/**
 * All metrics for a single time-series bucket with locale-formatted
 * date and time strings.
 */
type GroupValue = {
  bucket: string;
  date: string;
  input: number;
  output: number;
  request: number;
  time: string;
  total: number;
};

/** A single group (model or API key) with its time-series bucket values. */
type GroupEntry = {
  id: string;
  label: string;
  /** Sorted chronologically by buildGroupMap. */
  values: GroupValue[];
};

/**
 * Parses raw time_series entries into per-group buckets and sorts
 * each group chronologically.
 */
const buildGroupMap = (
  timeSeries: InferenceUsage['time_series']
): GroupEntry[] => {
  const map = new Map<string, GroupEntry>();

  for (const entry of timeSeries) {
    let group = map.get(entry.group_id);
    if (!group) {
      group = { id: entry.group_id, label: entry.group_label, values: [] };
      map.set(entry.group_id, group);
    }

    const date = new Date(entry.bucket);
    group.values.push({
      bucket: entry.bucket,
      date: date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      input: entry.input_tokens,
      output: entry.output_tokens,
      request: entry.request_count,
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
      }),
      total: entry.total_tokens,
    });
  }

  const groups = Array.from(map.values());
  for (const group of groups) {
    group.values.sort((a, b) =>
      a.bucket < b.bucket ? -1 : a.bucket > b.bucket ? 1 : 0
    );
  }

  return groups;
};

/** Extracts a single metric from pre-built groups into a ChartPayload. */
const toChartPayload = (
  groups: GroupEntry[],
  metric: UsageDataType
): ChartPayload => ({
  series: groups.map((g) => ({
    id: g.id,
    label: g.label,
    values: g.values.map((v) => ({
      date: v.date,
      time: v.time,
      value: v[metric],
    })),
  })),
});

/**
 * Transform API usage data to all chart formats.
 *
 * @param apiData - The usage data from the API
 * @returns All four ChartPayloads (input, output, request, total)
 */
export const transformAllUsageData = (
  apiData: InferenceUsage | undefined
): TransformedUsageData => {
  if (!apiData || !apiData.time_series || apiData.time_series.length === 0) {
    return {
      input: noDataPayload(),
      output: noDataPayload(),
      request: noDataPayload(),
      total: noDataPayload(),
    };
  }

  const groups = buildGroupMap(apiData.time_series);

  return {
    input: toChartPayload(groups, 'input'),
    output: toChartPayload(groups, 'output'),
    request: toChartPayload(groups, 'request'),
    total: toChartPayload(groups, 'total'),
  };
};

/**
 * Transform API usage data to chart format for a single metric.
 *
 * @param apiData - The usage data from the API
 * @param dataType - Which metric to extract (defaults to 'total')
 * @returns ChartPayload with series data, or a "no-data" placeholder if empty
 */
export const transformApiDataToChartPayload = (
  apiData: InferenceUsage | undefined,
  dataType: UsageDataType = 'total'
): ChartPayload => {
  if (!apiData || !apiData.time_series || apiData.time_series.length === 0) {
    return noDataPayload();
  }

  return toChartPayload(buildGroupMap(apiData.time_series), dataType);
};
