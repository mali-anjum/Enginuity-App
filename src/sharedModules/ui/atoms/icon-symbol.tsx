import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  magnifyingglass: 'search',
  'paperplane.fill': 'send',
  'note.text': 'description',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  sparkles: 'auto-awesome',
  'paintpalette.fill': 'palette',
  'person.crop.circle.fill': 'account-circle',
  'bolt.fill': 'bolt',
  'arrow.right.circle.fill': 'arrow-circle-right',
  'checkmark.circle.fill': 'check-circle',
  'exclamationmark.triangle.fill': 'warning',
  'xmark.circle.fill': 'cancel',
  eye: 'visibility',
  'eye.slash': 'visibility-off',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] ?? 'help-outline';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
