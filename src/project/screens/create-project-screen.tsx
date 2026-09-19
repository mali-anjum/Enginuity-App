import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/common/atoms/themed-text';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { ProPaywallModal } from '@/monetization/organisms/pro-paywall-modal';
import {
  fetchSubscriptionStatusThunk,
  openCheckoutThunk,
  selectCanCreateProject,
  selectIsCheckoutLoading,
} from '@/monetization/state/monetizationSlice';
import { ProjectForm, type ProjectFormValues } from '@/project/organisms/project-form';
import { createProjectThunk } from '@/project/state/projectSlice';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const INITIAL_VALUES: ProjectFormValues = {
  title: '',
  description: '',
  startDate: '',
  dueDate: '',
  status: 'active',
};

export default function CreateProjectScreen() {
  const [values, setValues] = useState<ProjectFormValues>(INITIAL_VALUES);
  const [showPaywall, setShowPaywall] = useState(false);
  const dispatch = useAppDispatch();
  const canCreateProject = useAppSelector(selectCanCreateProject);
  const isCheckoutLoading = useAppSelector(selectIsCheckoutLoading);
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Create Project</ThemedText>
        <ProjectForm
          values={values}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          submitLabel="Save Project"
          onSubmit={() => {
            if (!values.title.trim()) return;
            if (!canCreateProject) {
              setShowPaywall(true);
              return;
            }
            void (async () => {
              const created = await dispatch(
                createProjectThunk({
                  title: values.title.trim(),
                  description: values.description.trim(),
                  startDate: values.startDate.trim() || null,
                  dueDate: values.dueDate.trim() || null,
                  status: values.status,
                }),
              ).unwrap();
              router.replace(ROUTE_PATHS.PROJECT_DETAIL(created.id));
            })();
          }}
        />
      </ScrollView>
      <ProPaywallModal
        visible={showPaywall}
        title="You've reached 3 projects."
        description="Upgrade to Pro for unlimited projects."
        isUpgradeLoading={isCheckoutLoading}
        onClose={() => setShowPaywall(false)}
        onViewPlans={() => router.push(ROUTES.SETTINGS_UPGRADE)}
        onUpgrade={() => {
          void (async () => {
            await dispatch(openCheckoutThunk());
            await dispatch(fetchSubscriptionStatusThunk());
          })();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
});
