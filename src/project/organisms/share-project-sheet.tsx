import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import type { ShareRole } from '@/project/services/projectSharingService';

type Props = {
  visible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { email: string; role: ShareRole }) => void;
};

const ROLE_OPTIONS: ShareRole[] = ['owner', 'editor', 'viewer'];

export function ShareProjectSheet({ visible, isSubmitting, onClose, onSubmit }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ShareRole>('editor');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.border },
          ]}>
          <ThemedText type="subtitle">Share Project</ThemedText>
          <ThemedText style={{ color: themeColors.mutedText }}>
            Invite teammate by email. They will receive a deep link invite.
          </ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="teammate@example.com"
            placeholderTextColor={themeColors.mutedText}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
          />
          <View style={styles.roleRow}>
            {ROLE_OPTIONS.map((option) => {
              const selected = role === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setRole(option)}
                  style={[
                    styles.roleChip,
                    {
                      borderColor: selected ? themeColors.primary : themeColors.border,
                      backgroundColor: selected ? themeColors.heroTint : themeColors.surface,
                    },
                  ]}>
                  <ThemedText style={{ textTransform: 'capitalize' }}>{option}</ThemedText>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.actionRow}>
            <Pressable
              onPress={onClose}
              style={[styles.secondaryBtn, { borderColor: themeColors.border }]}>
              <ThemedText>Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => onSubmit({ email: email.trim(), role })}
              style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}>
              <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
                {isSubmitting ? 'Sending…' : 'Send Invite'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 10 },
  primaryBtn: { flex: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 10 },
});
