import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';

type NoteRichTextProps = {
  body: string;
};

type RichSegment = {
  text: string;
  bold: boolean;
  italic: boolean;
};

const TOKEN_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

function parseLine(line: string): RichSegment[] {
  const segments: RichSegment[] = [];
  let cursor = 0;
  let match = TOKEN_PATTERN.exec(line);

  while (match) {
    if (match.index > cursor) {
      segments.push({ text: line.slice(cursor, match.index), bold: false, italic: false });
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      segments.push({ text: token.slice(2, -2), bold: true, italic: false });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      segments.push({ text: token.slice(1, -1), bold: false, italic: true });
    }

    cursor = match.index + token.length;
    match = TOKEN_PATTERN.exec(line);
  }

  if (cursor < line.length) {
    segments.push({ text: line.slice(cursor), bold: false, italic: false });
  }

  return segments.length > 0 ? segments : [{ text: line, bold: false, italic: false }];
}

export function NoteRichText({ body }: NoteRichTextProps) {
  const lines = body.trim().length > 0 ? body.split('\n') : ['—'];

  return (
    <View style={styles.container}>
      {lines.map((line, lineIndex) => {
        const segments = parseLine(line);

        return (
          <ThemedText key={`${lineIndex}-${line}`} style={styles.line}>
            {segments.map((segment, segmentIndex) => (
              <Fragment key={`${lineIndex}-${segmentIndex}-${segment.text}`}>
                <Text
                  style={[
                    segment.bold ? styles.bold : null,
                    segment.italic ? styles.italic : null,
                  ]}>
                  {segment.text}
                </Text>
              </Fragment>
            ))}
          </ThemedText>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  line: { lineHeight: 22 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
});
