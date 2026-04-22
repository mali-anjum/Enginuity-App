import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { parseCsvPreviewRows } from '@/experiment/utils/csvPreview';

function inferAttachmentKind(url: string, type: string): 'image' | 'csv' | 'pdf' | 'unknown' {
  const lowerType = type.toLowerCase();
  const lowerUrl = url.toLowerCase();
  if (lowerType.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/.test(lowerUrl)) return 'image';
  if (lowerType.includes('csv') || /\.csv$/.test(lowerUrl)) return 'csv';
  if (lowerType.includes('pdf') || /\.pdf$/.test(lowerUrl)) return 'pdf';
  return 'unknown';
}

export default function AttachmentViewerScreen() {
  const { url, name, type } = useLocalSearchParams<{ url: string; name?: string; type?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const decodedUrl = url ? decodeURIComponent(url) : '';
  const decodedName = name ? decodeURIComponent(name) : 'Attachment';
  const decodedType = type ? decodeURIComponent(type) : '';
  const [rows, setRows] = useState<string[][]>([]);
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const kind = useMemo(
    () => inferAttachmentKind(decodedUrl, decodedType),
    [decodedType, decodedUrl],
  );

  useEffect(() => {
    if (kind !== 'csv' || !decodedUrl) return;
    let cancelled = false;
    setIsLoadingCsv(true);
    setCsvError(null);
    void (async () => {
      try {
        const response = await fetch(decodedUrl);
        const text = await response.text();
        const parsedRows = parseCsvPreviewRows(text, 20);
        if (cancelled) return;
        setRows(parsedRows);
        setIsLoadingCsv(false);
      } catch (error) {
        if (cancelled) return;
        setCsvError(error instanceof Error ? error.message : 'Failed to load CSV');
        setIsLoadingCsv(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [decodedUrl, kind]);

  const headers = useMemo(() => rows[0] ?? [], [rows]);
  const bodyRows = useMemo(() => (rows.length > 1 ? rows.slice(1) : []), [rows]);

  const handleDownload = async () => {
    if (!decodedUrl || !FileSystem.cacheDirectory) return;
    setIsDownloading(true);
    try {
      const fileName = decodedName.trim() || `attachment-${Date.now()}`;
      const destination = `${FileSystem.cacheDirectory}${Date.now()}-${fileName}`;
      const result = await FileSystem.downloadAsync(decodedUrl, destination);
      if (kind === 'image') {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.saveToLibraryAsync(result.uri);
        } else if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.uri);
        }
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ThemedView style={[styles.screen, { backgroundColor: themeColors.surface }]}>
      <View style={styles.headerRow}>
        <ThemedText type="title">Attachment Viewer</ThemedText>
        <Pressable
          onPress={() => void handleDownload()}
          style={[styles.downloadButton, { borderColor: themeColors.primary }]}>
          <ThemedText style={{ color: themeColors.primary }}>
            {isDownloading ? 'Downloading…' : 'Download'}
          </ThemedText>
        </Pressable>
      </View>
      <ThemedText>{decodedName}</ThemedText>

      {decodedUrl && kind === 'image' ? (
        <ScrollView
          style={styles.zoomWrap}
          contentContainerStyle={styles.zoomContent}
          minimumZoomScale={1}
          maximumZoomScale={4}
          pinchGestureEnabled>
          <Image source={{ uri: decodedUrl }} style={styles.image} contentFit="contain" />
        </ScrollView>
      ) : null}

      {decodedUrl && kind === 'pdf' ? (
        <WebView source={{ uri: decodedUrl }} style={styles.webView} />
      ) : null}

      {decodedUrl && kind === 'csv' ? (
        <View style={styles.csvWrap}>
          <ThemedText style={{ color: themeColors.mutedText }}>Showing first 20 rows</ThemedText>
          {isLoadingCsv ? <ThemedText>Loading CSV…</ThemedText> : null}
          {csvError ? <ThemedText style={{ color: themeColors.danger }}>{csvError}</ThemedText> : null}
          {!isLoadingCsv && !csvError && rows.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No CSV rows found.</ThemedText>
          ) : null}
          {rows.length > 0 ? (
            <ScrollView horizontal>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  {headers.map((cell, idx) => (
                    <View
                      key={`header-${idx}`}
                      style={[
                        styles.cell,
                        { borderColor: themeColors.border, backgroundColor: themeColors.heroTint },
                      ]}>
                      <ThemedText type="defaultSemiBold">{cell || `Column ${idx + 1}`}</ThemedText>
                    </View>
                  ))}
                </View>
                {bodyRows.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.tableRow}>
                    {headers.map((_, cellIndex) => (
                      <View
                        key={`cell-${rowIndex}-${cellIndex}`}
                        style={[
                          styles.cell,
                          { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                        ]}>
                        <ThemedText>{row[cellIndex] ?? ''}</ThemedText>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      {!decodedUrl ? (
        <ThemedText>No attachment URL provided.</ThemedText>
      ) : kind === 'unknown' ? (
        <ThemedText style={{ color: themeColors.mutedText }}>
          Unsupported preview type. Use Download to open in another app.
        </ThemedText>
      ) : (
        <ThemedText style={{ color: themeColors.mutedText }}>
          Use Download to save to gallery/files.
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  downloadButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  zoomWrap: { flex: 1, width: '100%' },
  zoomContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  webView: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  csvWrap: { flex: 1, gap: 10 },
  table: { gap: 0 },
  tableRow: { flexDirection: 'row' },
  cell: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, minWidth: 110 },
});
