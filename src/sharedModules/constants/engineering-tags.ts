export const SEEDED_ENGINEERING_TAGS = [
  'PID',
  'I2C',
  'SPI',
  'UART',
  'PWM',
  'Kalman Filter',
  'Arduino',
  'ESP32',
  'MPU6050',
  'STM32',
  'ROS',
  'MATLAB',
  'Python',
  'C++',
  'Bluetooth',
  'WiFi',
  'LoRa',
] as const;

const TAG_COLORS = [
  '#0EA5E9',
  '#14B8A6',
  '#6366F1',
  '#EC4899',
  '#F97316',
  '#22C55E',
  '#A855F7',
  '#EAB308',
  '#06B6D4',
  '#3B82F6',
] as const;

export function colorForTag(tag: string): string {
  let hash = 0;
  for (let index = 0; index < tag.length; index += 1) {
    hash = (hash << 5) - hash + tag.charCodeAt(index);
    hash |= 0;
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}
