import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { AppSheet } from './AppSheet';
import { useThemedStyles } from '../theme';
import type { ThemeColors, ThemeShadows } from '../theme';
import { SPACING, TYPOGRAPHY } from '../constants';
import { GITHUB_URL, shareOnX } from '../utils/sharePrompt';
import { useAppStore } from '../stores/appStore';

interface SharePromptSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const SharePromptSheet: React.FC<SharePromptSheetProps> = ({ visible, onClose }) => {
  const styles = useThemedStyles(createStyles);
  const setEngaged = useAppStore(s => s.setHasEngagedSharePrompt);
  const { t } = useTranslation();

  const handleEngage = (action: string | (() => void)) => {
    setEngaged(true);
    if (typeof action === 'string') Linking.openURL(action);
    else action();
    onClose();
  };

  return (
    <AppSheet visible={visible} onClose={onClose} enableDynamicSizing title={t('sharePrompt.title')}>
      <View style={styles.content}>
        <Text style={styles.message}>{t('sharePrompt.message')}</Text>

        <TouchableOpacity style={styles.button} onPress={() => handleEngage(GITHUB_URL)}>
          <Icon name="star" size={18} color={styles.buttonText.color} />
          <Text style={styles.buttonText}>{t('sharePrompt.starOnGitHub')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => handleEngage(shareOnX)}>
          <Icon name="share-2" size={18} color={styles.buttonText.color} />
          <Text style={styles.buttonText}>{t('sharePrompt.shareOnX')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
          <Text style={styles.dismissText}>{t('sharePrompt.maybeLater')}</Text>
        </TouchableOpacity>
      </View>
    </AppSheet>
  );
};

const createStyles = (colors: ThemeColors, _shadows: ThemeShadows) => ({
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    alignItems: 'center' as const,
  },
  message: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  button: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: SPACING.sm,
    width: '100%' as const,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: colors.primary,
  },
  dismissButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  dismissText: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textMuted,
  },
});
