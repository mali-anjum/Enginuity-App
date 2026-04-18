import type {
  FocusArea,
  InstitutionType,
  UsageLocation,
  UsageTimePreference,
  WeeklyHoursBand,
} from '@/onboarding/types/profileDraft';

export const FOCUS_AREA_OPTIONS: { value: FocusArea; label: string }[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'robotics', label: 'Robotics & mechatronics' },
  { value: 'cs', label: 'Computer science / embedded' },
  { value: 'physics', label: 'Physics & instrumentation' },
  { value: 'other', label: 'Other / interdisciplinary' },
];

export const INSTITUTION_TYPE_OPTIONS: { value: InstitutionType; label: string }[] = [
  { value: 'university', label: 'University' },
  { value: 'institute', label: 'Research institute' },
  { value: 'company', label: 'Company / lab' },
  { value: 'school', label: 'School' },
  { value: 'self', label: 'Independent / self-study' },
  { value: 'other', label: 'Other' },
];

export const USAGE_TIME_OPTIONS: { value: UsageTimePreference; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Late night' },
  { value: 'flexible', label: 'Flexible' },
];

export const USAGE_LOCATION_OPTIONS: { value: UsageLocation; label: string }[] = [
  { value: 'lab', label: 'Lab / workshop' },
  { value: 'home', label: 'Home' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'office', label: 'Office' },
  { value: 'mixed', label: 'Mixed' },
];

export const WEEKLY_HOURS_OPTIONS: { value: WeeklyHoursBand; label: string }[] = [
  { value: 'under_2', label: 'Under 2 hours' },
  { value: '2_to_5', label: '2–5 hours' },
  { value: '5_to_10', label: '5–10 hours' },
  { value: '10_plus', label: '10+ hours' },
];

export const DISCOVERY_OPTIONS = [
  'Friend or colleague',
  'University / course',
  'Social media',
  'Search engine',
  'App store',
  'Other',
] as const;
