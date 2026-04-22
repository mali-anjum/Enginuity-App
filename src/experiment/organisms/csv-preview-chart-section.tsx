import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import Svg, { Circle, Line as SvgLine } from 'react-native-svg';

import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import {
  parseCsvChartPreview,
  type CsvChartPreview,
  type CsvChartSeriesPoint,
} from '@/experiment/utils/csvChart';

type ChartType = 'line' | 'bar' | 'scatter';

type Props = {
  csvUrl: string;
  csvName: string;
};

function buildChartLabel(label: string): string {
  return label.length <= 8 ? label : `${label.slice(0, 8)}...`;
}

function buildLabelValues(points: CsvChartSeriesPoint[]): string[] {
  if (points.length <= 8) return points.map((point) => buildChartLabel(`${point.x}`));
  const stride = Math.ceil(points.length / 8);
  return points.map((point, index) => (index % stride === 0 ? buildChartLabel(`${point.x}`) : ''));
}

function ScatterPlot({
  points,
  width,
  height,
  color,
  borderColor,
}: {
  points: CsvChartSeriesPoint[];
  width: number;
  height: number;
  color: string;
  borderColor: string;
}) {
  const plotPadding = 20;
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  return (
    <View style={[styles.scatterWrap, { borderColor }]}>
      <Svg width={width} height={height}>
        <SvgLine
          x1={plotPadding}
          y1={height - plotPadding}
          x2={width - plotPadding}
          y2={height - plotPadding}
          stroke={borderColor}
          strokeWidth={1}
        />
        <SvgLine
          x1={plotPadding}
          y1={plotPadding}
          x2={plotPadding}
          y2={height - plotPadding}
          stroke={borderColor}
          strokeWidth={1}
        />
        {points.map((point, index) => {
          const x = plotPadding + ((point.x - minX) / xRange) * (width - plotPadding * 2);
          const y = height - plotPadding - ((point.y - minY) / yRange) * (height - plotPadding * 2);
          return <Circle key={`scatter-${index}`} cx={x} cy={y} r={3} fill={color} />;
        })}
      </Svg>
    </View>
  );
}

export function CsvPreviewChartSection({ csvUrl, csvName }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<CsvChartPreview | null>(null);
  const [xColumn, setXColumn] = useState<number | null>(null);
  const [yColumn, setYColumn] = useState<number | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setPreview(null);
    void (async () => {
      try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        const parsedPreview = parseCsvChartPreview(text, 500);
        if (cancelled) return;
        setPreview(parsedPreview);
        if (parsedPreview.numericColumnIndexes.length >= 2) {
          const defaultX = parsedPreview.numericColumnIndexes[0];
          const defaultY = parsedPreview.numericColumnIndexes[1];
          setXColumn(defaultX);
          setYColumn(defaultY);
        } else {
          setXColumn(null);
          setYColumn(null);
        }
        setIsLoading(false);
      } catch (fetchError) {
        if (cancelled) return;
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load CSV data');
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [csvUrl]);

  const points = useMemo<CsvChartSeriesPoint[]>(() => {
    if (!preview || xColumn === null || yColumn === null) return [];
    return preview.pointsByColumnPair(xColumn, yColumn);
  }, [preview, xColumn, yColumn]);

  const chartWidth = Math.max(Dimensions.get('window').width - 56, 280);
  const headers = preview?.headers ?? [];
  const numericColumns = preview?.numericColumnIndexes ?? [];
  const xLabel = xColumn !== null ? headers[xColumn] ?? `Column ${xColumn + 1}` : 'X';
  const yLabel = yColumn !== null ? headers[yColumn] ?? `Column ${yColumn + 1}` : 'Y';

  const chartData = useMemo(
    () => ({
      labels: buildLabelValues(points),
      datasets: [{ data: points.map((point) => point.y) }],
    }),
    [points],
  );

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: themeColors.surfaceElevated,
      backgroundGradientTo: themeColors.surfaceElevated,
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(51, 102, 204, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(80, 80, 80, ${opacity})`,
      propsForDots: {
        r: '3',
        strokeWidth: '1',
        stroke: themeColors.primary,
      },
      propsForBackgroundLines: {
        stroke: themeColors.border,
        strokeDasharray: '',
      },
    }),
    [themeColors.border, themeColors.primary, themeColors.surfaceElevated],
  );

  return (
    <View style={styles.wrap}>
      <ThemedText type="defaultSemiBold">Preview Data</ThemedText>
      <ThemedText style={{ color: themeColors.mutedText }}>{csvName}</ThemedText>
      {preview?.rowsLimited ? (
        <ThemedText style={{ color: themeColors.accent }}>Showing first 500 rows.</ThemedText>
      ) : null}

      {isLoading ? <ThemedText>Loading chart data…</ThemedText> : null}
      {error ? <ThemedText style={{ color: themeColors.danger }}>{error}</ThemedText> : null}

      {!isLoading && !error && numericColumns.length < 2 ? (
        <ThemedText style={{ color: themeColors.mutedText }}>
          Not enough numeric columns to plot a chart.
        </ThemedText>
      ) : null}

      {numericColumns.length >= 2 ? (
        <>
          <View style={styles.pickerGroup}>
            <ThemedText type="defaultSemiBold">X-axis column</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {numericColumns.map((columnIndex) => {
                const active = xColumn === columnIndex;
                return (
                  <Pressable
                    key={`x-${columnIndex}`}
                    onPress={() => setXColumn(columnIndex)}
                    style={[
                      styles.pickerChip,
                      {
                        borderColor: active ? themeColors.primary : themeColors.border,
                        backgroundColor: active ? themeColors.heroTint : themeColors.surfaceElevated,
                      },
                    ]}>
                    <ThemedText>{headers[columnIndex] ?? `Column ${columnIndex + 1}`}</ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.pickerGroup}>
            <ThemedText type="defaultSemiBold">Y-axis column</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {numericColumns.map((columnIndex) => {
                const active = yColumn === columnIndex;
                return (
                  <Pressable
                    key={`y-${columnIndex}`}
                    onPress={() => setYColumn(columnIndex)}
                    style={[
                      styles.pickerChip,
                      {
                        borderColor: active ? themeColors.primary : themeColors.border,
                        backgroundColor: active ? themeColors.heroTint : themeColors.surfaceElevated,
                      },
                    ]}>
                    <ThemedText>{headers[columnIndex] ?? `Column ${columnIndex + 1}`}</ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.pickerGroup}>
            <ThemedText type="defaultSemiBold">Chart type</ThemedText>
            <View style={styles.chipsRow}>
              {(['line', 'bar', 'scatter'] as const).map((type) => {
                const active = chartType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setChartType(type)}
                    style={[
                      styles.pickerChip,
                      {
                        borderColor: active ? themeColors.primary : themeColors.border,
                        backgroundColor: active ? themeColors.heroTint : themeColors.surfaceElevated,
                      },
                    ]}>
                    <ThemedText style={{ textTransform: 'capitalize' }}>{type}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ThemedText style={{ color: themeColors.mutedText }}>
            Plotting {xLabel} (X) vs {yLabel} (Y)
          </ThemedText>

          {points.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              No numeric rows available for selected columns.
            </ThemedText>
          ) : chartType === 'line' ? (
            <LineChart
              data={chartData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : chartType === 'bar' ? (
            <BarChart
              data={chartData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
            />
          ) : (
            <ScatterPlot
              points={points}
              width={chartWidth}
              height={220}
              color={themeColors.primary}
              borderColor={themeColors.border}
            />
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  pickerGroup: { gap: 8 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  pickerChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chart: { borderRadius: 12 },
  scatterWrap: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
});
