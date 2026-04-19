/**
 * Single source of truth for hardware component categories in the local library.
 * Add new categories here and use {@link HARDWARE_CATEGORIES} in forms, filters, and pickers.
 */
export const HARDWARE_CATEGORIES = ['MCU', 'Sensor', 'Actuator', 'Module', 'Tool'] as const;

export type HardwareCategory = (typeof HARDWARE_CATEGORIES)[number];
