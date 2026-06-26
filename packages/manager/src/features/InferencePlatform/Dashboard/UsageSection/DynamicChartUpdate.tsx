import React from 'react';

import {
  StackedBarChart,
  type StackedBarChartProps,
} from 'src/components/StackedBarChart';

import { filterChartPayloadBySeries } from './chartUtils';

import type { ChartPayload, DataSeries } from './chartUtils';

type ManagedProps = 'data' | 'seriesColorIndices';

type DynamicChartUpdateProps = Omit<StackedBarChartProps, ManagedProps> & {
  chartComponent?: React.ComponentType<StackedBarChartProps>;
  data: ChartPayload;
  selectedSeriesId: string;
  seriesColorIndices?: Record<string, number>;
  updateIntervalMs?: number;
};

const DEFAULT_UPDATE_INTERVAL_MS = 15000;
const DEFAULT_START_DATE = '10/06/2026';

const cloneData = (data: ChartPayload): ChartPayload => ({
  series: data.series.map((series) => ({
    ...series,
    values: series.values.map((point) => ({ ...point })),
  })),
});

const getDeterministicIntInRange = (
  min: number,
  max: number,
  seedText: string
) => {
  if (max <= min) {
    return min;
  }

  const hash = seedText.split('').reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) % 104_729;
  }, 7);

  return min + (hash % (max - min + 1));
};

const formatDate = (day: number, month: number, year: number) => {
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

const parseDate = (date?: string) => {
  const [dayString, monthString, yearString] = (
    date ?? DEFAULT_START_DATE
  ).split('/');
  const day = Number.parseInt(dayString, 10);
  const month = Number.parseInt(monthString, 10);
  const year = Number.parseInt(yearString, 10);

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    return { day: 10, month: 6, year: 2026 };
  }

  return {
    day: Math.min(Math.max(day, 1), 31),
    month: Math.min(Math.max(month, 1), 12),
    year,
  };
};

const getNextDate = (date?: string) => {
  const { day, month, year } = parseDate(date);
  let nextDay = day + 1;
  let nextMonth = month;

  if (nextDay > 31) {
    nextDay = 1;
    nextMonth += 1;
  }

  if (nextMonth > 12) {
    nextMonth = 1;
  }

  return formatDate(nextDay, nextMonth, year);
};

const getNextDateAndTime = (date: string | undefined, time: string) => {
  const [hourString, minuteString = '00'] = time.split(':');
  const hour = Number.parseInt(hourString, 10);
  const normalizedDate = date ?? DEFAULT_START_DATE;

  if (Number.isNaN(hour)) {
    return {
      date: normalizedDate,
      time: `00:${minuteString}`,
    };
  }

  if (hour === 24) {
    return {
      date: getNextDate(normalizedDate),
      time: `00:${minuteString}`,
    };
  }

  if (hour >= 0 && hour < 24) {
    return {
      date: normalizedDate,
      time: `${String(hour + 1).padStart(2, '0')}:${minuteString}`,
    };
  }

  const normalizedHour = ((hour % 24) + 24) % 24;
  return {
    date: normalizedDate,
    time: `${String(normalizedHour + 1).padStart(2, '0')}:${minuteString}`,
  };
};

const getHourOfDay = (time: string): number => {
  const [hourString] = time.split(':');
  const parsedHour = Number.parseInt(hourString, 10);

  if (Number.isNaN(parsedHour)) {
    return 0;
  }

  return ((parsedHour % 24) + 24) % 24;
};

const getNextTokenValue = (
  nextDate: string | undefined,
  nextTime: string,
  seriesId: string
): number => {
  const hourOfDay = getHourOfDay(nextTime);
  const normalizedDate = nextDate ?? DEFAULT_START_DATE;
  const seed = `${normalizedDate}|${nextTime}|${seriesId}`;

  // Night: lower traffic profile.
  if (hourOfDay >= 0 && hourOfDay < 8) {
    return getDeterministicIntInRange(10, 400, seed);
  }

  if (hourOfDay >= 8 && hourOfDay < 17) {
    return getDeterministicIntInRange(10, 1200, seed);
  }

  // Evening: higher traffic that tapers toward midnight.
  if (hourOfDay >= 17 && hourOfDay <= 22) {
    const eveningRangesByHour: Record<number, [number, number]> = {
      17: [300, 900],
      18: [400, 1500],
      19: [950, 2100],
      20: [900, 2550],
      21: [550, 1400],
      22: [300, 950],
    };
    const [min, max] = eveningRangesByHour[hourOfDay];
    return getDeterministicIntInRange(min, max, seed);
  }

  // Late evening bridge to midnight.
  if (hourOfDay === 23) {
    return getDeterministicIntInRange(30, 300, seed);
  }

  // Daytime baseline.
  return getDeterministicIntInRange(300, 1100, seed);
};

const rollSeriesForward = (series: DataSeries): DataSeries => {
  if (series.values.length === 0) {
    return series;
  }

  const shiftedValues = series.values.slice(1).map((value) => ({ ...value }));
  const tailSource =
    shiftedValues[shiftedValues.length - 1] ??
    series.values[series.values.length - 1];

  const nextValues = [
    ...shiftedValues,
    (() => {
      const nextPointDateTime = getNextDateAndTime(
        tailSource.date,
        tailSource.time
      );

      return {
        date: nextPointDateTime.date,
        time: nextPointDateTime.time,
        value: getNextTokenValue(
          nextPointDateTime.date,
          nextPointDateTime.time,
          series.id
        ),
      };
    })(),
  ];

  return {
    ...series,
    values: nextValues,
  };
};

export const DynamicChartUpdate = ({
  chartComponent = StackedBarChart,
  data,
  selectedSeriesId,
  seriesColorIndices,
  updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
  ...chartProps
}: DynamicChartUpdateProps) => {
  const [dynamicData, setDynamicData] = React.useState<ChartPayload>(() =>
    cloneData(data)
  );

  React.useEffect(() => {
    setDynamicData(cloneData(data));
  }, [data]);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDynamicData((previousData) => ({
        ...previousData,
        series: previousData.series.map(rollSeriesForward),
      }));
    }, updateIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [updateIntervalMs]);

  const filteredData = React.useMemo(
    () => filterChartPayloadBySeries(dynamicData, selectedSeriesId),
    [dynamicData, selectedSeriesId]
  );

  return React.createElement(chartComponent, {
    ...chartProps,
    data: filteredData,
    seriesColorIndices,
  });
};
