import type { AuthDiscipline } from '@/auth/state/authSlice';

/** Focus areas shown during onboarding (maps to profile.field_of_study + discipline). */
export type FocusArea =
  | 'electronics'
  | 'robotics'
  | 'cs'
  | 'physics'
  | 'other';

export type InstitutionType = 'university' | 'institute' | 'company' | 'school' | 'self' | 'other';

export type UsageTimePreference = 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';

export type UsageLocation = 'lab' | 'home' | 'classroom' | 'office' | 'mixed';

export type WeeklyHoursBand = 'under_2' | '2_to_5' | '5_to_10' | '10_plus';

export type OnboardingProfileDraft = {
  focusAreas: FocusArea[];
  institutionName: string;
  institutionType: InstitutionType | null;
  fieldOfStudy: string;
  usageTimePreference: UsageTimePreference | null;
  usageLocation: UsageLocation | null;
  weeklyHoursBand: WeeklyHoursBand | null;
  primaryGoal: string;
  discoverySource: string;
};

export const INITIAL_ONBOARDING_PROFILE_DRAFT: OnboardingProfileDraft = {
  focusAreas: [],
  institutionName: '',
  institutionType: null,
  fieldOfStudy: '',
  usageTimePreference: null,
  usageLocation: null,
  weeklyHoursBand: null,
  primaryGoal: '',
  discoverySource: '',
};

/** Map onboarding focus tags to stored profile.discipline enum. */
export function mapFocusAreasToAuthDiscipline(areas: FocusArea[]): AuthDiscipline {
  const primary = areas[0] ?? 'other';
  const map: Record<FocusArea, AuthDiscipline> = {
    electronics: 'electrical',
    robotics: 'mechanical',
    cs: 'software',
    physics: 'mechanical',
    other: 'other',
  };
  return map[primary] ?? 'other';
}
