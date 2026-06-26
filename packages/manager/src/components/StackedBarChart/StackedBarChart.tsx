import { useTheme } from '@mui/material/styles';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StackedBarChartTooltip } from './StackedBarChartTooltip';

const LABEL_COLOR_DARK = 'hsl(220, 14%, 82%)';
const LABEL_COLOR_LIGHT = 'hsl(220, 9%, 36%)';

export type DataPoint = {
  date?: string;
  time: string;
  value: number;
};

export type DataSeries = {
  color?: string;
  id: string;
  label: string;
  values: DataPoint[];
};

export type ChartPayload = {
  series: DataSeries[];
};

export type StackedBarChartProps = {
  barAnimationDuration?: number;
  barHighlightColor?: string;
  barHoverColor?: string;
  barWidth?: number;
  data: ChartPayload;
  gridStrokeColor?: string;
  height?: number;
  legendFontSize?: number;
  legendIconSize?: number;
  legendItemSpacing?: number;
  legendTextColor?: string;
  seriesColorIndices?: Record<string, number>;
  stacked?: boolean;
  stackId?: string;
  tooltipAnimationDuration?: number;
  tooltipDateTimeColor?: string;
  tooltipTitle?: string;
  valueFormatter?: (value: number) => string;
  xAxisColor?: string;
  xAxisLabelColor?: string;
  yAxisColor?: string;
  yAxisLabelColor?: string;
};

type ThemeColor = {
  dark: string;
  light: string;
};

const FALLBACK_COLORS: ThemeColor[] = [
  { dark: 'hsl(217, 75%, 58%)', light: 'hsl(217, 91%, 64%)' },
  { dark: 'hsl(131, 56%, 41%)', light: 'hsl(131, 71%, 47%)' },
  { dark: 'hsl(41, 90%, 45%)', light: 'hsl(41, 100%, 50%)' },
  { dark: 'hsl(271, 50%, 61%)', light: 'hsl(271, 58%, 60%)' },
  { dark: 'hsl(0, 64%, 52%)', light: 'hsl(0, 78%, 58%)' },
  { dark: 'hsl(187, 72%, 41%)', light: 'hsl(187, 94%, 41%)' },
  { dark: 'hsl(290, 56%, 41%)', light: 'hsl(290, 71%, 47%)' },
  { dark: 'hsl(161, 56%, 41%)', light: 'hsl(161, 71%, 47%)' },
];

const THEME_COLORS = {
  barHighlight: {
    dark: 'hsla(220, 20%, 8%, 0.2)',
    light: 'hsla(220, 18%, 22%, 0.2)',
  },
  xAxis: {
    dark: 'hsl(220, 14%, 52%)',
    light: 'hsl(220, 10%, 56%)',
  },
  xAxisLabel: {
    dark: LABEL_COLOR_DARK,
    light: LABEL_COLOR_LIGHT,
  },
  yAxis: {
    dark: 'hsl(220, 14%, 52%)',
    light: 'hsl(220, 10%, 56%)',
  },
  yAxisLabel: {
    dark: LABEL_COLOR_DARK,
    light: LABEL_COLOR_LIGHT,
  },
  gridStroke: {
    dark: 'hsl(220, 16%, 44%)',
    light: 'hsl(220, 13%, 84%)',
  },
  legendText: {
    dark: LABEL_COLOR_DARK,
    light: LABEL_COLOR_LIGHT,
  },
};

const resolveThemeColor = (
  mode: 'dark' | 'light',
  colors: ThemeColor,
  override?: string
) => {
  if (override) {
    return override;
  }

  return mode === 'light' ? colors.light : colors.dark;
};

const defaultValueFormatter = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

const getStableColorIndex = (seriesId: string, colorCount: number) => {
  // Use a deterministic hash of the series ID to always get the same color
  const hash = Array.from(seriesId).reduce(
    (currentHash, character) => currentHash + character.charCodeAt(0),
    0
  );
  return hash % colorCount;
};

export const StackedBarChart = ({
  xAxisColor, // Color override  for the X-axis line. CSS color string.
  xAxisLabelColor, // Color override for X-axis tick labels. CSS color string.
  yAxisColor, // Color override  for the Y-axis line. CSS color string.
  yAxisLabelColor, // Color override  for Y-axis tick labels. CSS color string.
  barAnimationDuration = 400, // Bar entrance/update animation duration in ms. Unit: ms. Default: 400.
  barHighlightColor, // Color override for the hover highlight rectangle. CSS color string. Takes precedence over barHoverColor.
  barHoverColor, // Alias for barHighlightColor. Ignored when barHighlightColor is also set.
  barWidth, // Fixed pixel width of each bar. When omitted, Recharts sizes bars automatically. Unit: px.
  data, // Chart data: { series: [{ id, label, values: [{ time, value, date? }] }] }
  gridStrokeColor, // Color override for chart grid lines. CSS color string.
  height = 250, // Height of the chart canvas area. Unit: px. Default: 250.
  legendFontSize = 12, // Font size of legend item labels. Unit: px. Default: 12.
  legendIconSize = 12, // Width and height of each legend color swatch. Unit: px. Default: 12.
  legendItemSpacing = 23, // Horizontal gap between legend items. Unit: px. Default: 23.
  legendTextColor, // Color override for legend label text. CSS color string.
  seriesColorIndices, // Maps series id → color palette index for consistent colors across filtered views.
  stackId, // Custom Recharts stackId when stacked=true. Default: 'stack-1'.
  stacked = true, // When true, bars are stacked. When false, bars are side-by-side. Default: true.
  tooltipDateTimeColor, // Color override for the tooltip date/time subtitle. CSS color string.
  tooltipTitle = 'Chart Data', // Title shown at the top of the hover tooltip. Default: 'Chart Data'.
  tooltipAnimationDuration = 150, // Tooltip fade-in animation duration. Unit: ms. Default: 150.
  valueFormatter = defaultValueFormatter, // Formats values for Y-axis ticks and tooltip. (value: number) => string.
}: StackedBarChartProps) => {
  const cmTheme = useTheme();

  const resolvedLegendTextColor =
    legendTextColor ?? cmTheme.palette.text.secondary;
  const resolvedXAxisColor = xAxisColor ?? cmTheme.tokens.alias.Border.Neutral;
  const resolvedXAxisLabelColor =
    xAxisLabelColor ?? cmTheme.palette.text.secondary;
  const resolvedYAxisColor = yAxisColor ?? cmTheme.tokens.alias.Border.Neutral;
  const resolvedYAxisLabelColor =
    yAxisLabelColor ?? cmTheme.palette.text.secondary;
  const resolvedGridStrokeColor =
    gridStrokeColor ?? cmTheme.tokens.alias.Border.Normal;
  const resolvedBarHighlightColor = resolveThemeColor(
    cmTheme.palette.mode,
    THEME_COLORS.barHighlight,
    barHighlightColor ?? barHoverColor
  );

  const keyedSeries = React.useMemo(() => {
    const series = data?.series ?? [];
    return series.map((item) => {
      const colorIndex =
        seriesColorIndices?.[item.id] ??
        getStableColorIndex(item.id, FALLBACK_COLORS.length);

      return {
        ...item,
        color: resolveThemeColor(
          cmTheme.palette.mode,
          FALLBACK_COLORS[colorIndex % FALLBACK_COLORS.length],
          item.color
        ),
        dataKey: item.id,
      };
    });
  }, [data, seriesColorIndices, cmTheme.palette.mode]);

  const chartData = React.useMemo(() => {
    const pointCount = Math.max(
      ...keyedSeries.map((item) => item.values.length),
      0
    );

    return Array.from({ length: pointCount }, (_, index) => {
      const referencePoint = keyedSeries[0]?.values[index];
      const pointTime = referencePoint?.time ?? '';
      const pointDate = referencePoint?.date;
      const tooltipLabel = pointDate ? `${pointDate} ${pointTime}` : pointTime;
      const row: { [key: string]: number | string } = {
        time: pointTime,
        tooltipLabel,
      };

      keyedSeries.forEach((item) => {
        row[item.dataKey] = item.values[index]?.value ?? 0;
      });

      return row;
    });
  }, [keyedSeries]);

  if (keyedSeries.length === 0) {
    return null;
  }

  return (
    <div>
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            barCategoryGap="31%"
            barSize={barWidth}
            data={chartData}
            margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
          >
            <CartesianGrid
              stroke={resolvedGridStrokeColor}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              interval={1}
              minTickGap={16}
              stroke={resolvedXAxisColor}
              tick={{ fill: resolvedXAxisLabelColor }}
            />
            <YAxis
              stroke={resolvedYAxisColor}
              tick={{ fill: resolvedYAxisLabelColor }}
              tickFormatter={(value) => valueFormatter(value as number)}
            />
            <Tooltip
              animationDuration={tooltipAnimationDuration}
              content={(props) => (
                <StackedBarChartTooltip
                  active={props.active}
                  label={props.label}
                  payload={props.payload}
                  tooltipDateTimeColor={tooltipDateTimeColor}
                  tooltipTitle={tooltipTitle}
                  valueFormatter={valueFormatter}
                />
              )}
              cursor={{ fill: resolvedBarHighlightColor }}
            />
            {keyedSeries.map((item) => (
              <Bar
                activeBar={false}
                animationDuration={barAnimationDuration}
                dataKey={item.dataKey}
                fill={item.color}
                key={item.dataKey}
                name={item.label}
                stackId={stacked ? (stackId ?? 'stack-1') : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: legendItemSpacing,
          justifyContent: 'center',
          marginTop: 8,
          width: '100%',
        }}
      >
        {keyedSeries.map((item) => (
          <div
            key={`legend-${item.dataKey}`}
            style={{
              alignItems: 'center',
              color: resolvedLegendTextColor,
              display: 'inline-flex',
              fontSize: legendFontSize,
              gap: 6,
            }}
          >
            <span
              style={{
                background: item.color,
                borderRadius: 2,
                display: 'inline-block',
                height: legendIconSize,
                width: legendIconSize,
              }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
