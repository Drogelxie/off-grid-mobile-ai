import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../components';
import { CustomAlert, showAlert, hideAlert, AlertState, initialAlertState } from '../components/CustomAlert';
import { useTheme, useThemedStyles } from '../theme';
import type { ThemeColors, ThemeShadows } from '../theme';
import { TYPOGRAPHY, SPACING } from '../constants';
import { useWhisperStore } from '../stores';
import { WHISPER_MODELS } from '../services';

export const VoiceSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [alertState, setAlertState] = useState<AlertState>(initialAlertState);
  const {
    downloadedModelId: whisperModelId,
    isDownloading: isWhisperDownloading,
    downloadProgress: whisperProgress,
    downloadModel: downloadWhisperModel,
    deleteModel: deleteWhisperModel,
    error: whisperError,
    clearError: clearWhisperError,
  } = useWhisperStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('voice.title')}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <Text style={styles.description}>
            {t('voice.description')}
          </Text>

          {(() => {
            if (whisperModelId) {
              return (
                <View style={styles.modelInfo}>
                  <View style={styles.modelHeader}>
                    <Text style={styles.modelName}>
                      {WHISPER_MODELS.find(m => m.id === whisperModelId)?.name || whisperModelId}
                    </Text>
                    <Text style={styles.modelStatus}>{t('voice.downloaded')}</Text>
                  </View>
                  <Button
                    title={t('voice.removeModel')}
                    variant="outline"
                    size="small"
                    onPress={() => {
                      setAlertState(showAlert(
                        t('voice.removeModelAlertTitle'),
                        t('voice.removeConfirm'),
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: () => {
                              setAlertState(hideAlert());
                              deleteWhisperModel();
                            },
                          },
                        ]
                      ));
                    }}
                    style={styles.removeButton}
                  />
                </View>
              );
            }
            if (isWhisperDownloading) {
              return (
                <View style={styles.downloading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.downloadingText}>
                    {t('voice.downloading', { percent: Math.round(whisperProgress * 100) })}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${whisperProgress * 100}%` }]}
                    />
                  </View>
                </View>
              );
            }
            return (
              <View style={styles.modelList}>
                <Text style={styles.selectLabel}>{t('voice.selectLabel')}</Text>
                {WHISPER_MODELS.slice(0, 3).map((model) => (
                  <TouchableOpacity
                    key={model.id}
                    style={styles.modelOption}
                    onPress={() => downloadWhisperModel(model.id)}
                  >
                    <View style={styles.modelOptionInfo}>
                      <Text style={styles.modelOptionName}>{model.name}</Text>
                      <Text style={styles.modelOptionSize}>{model.size} MB</Text>
                    </View>
                    <Text style={styles.modelOptionDesc}>{model.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })()}

          {whisperError && (
            <TouchableOpacity onPress={clearWhisperError}>
              <Text style={styles.error}>{whisperError}</Text>
            </TouchableOpacity>
          )}
        </Card>

        <Card style={styles.privacyCard}>
          <View style={styles.privacyIconContainer}>
            <Icon name="mic" size={18} color={colors.textSecondary} />
          </View>
          <Text style={styles.privacyTitle}>{t('voice.privacyTitle')}</Text>
          <Text style={styles.privacyText}>
            {t('voice.privacyDescription')}
          </Text>
        </Card>
      </ScrollView>
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={() => setAlertState(hideAlert())}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors, shadows: ThemeShadows) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.small,
    zIndex: 1,
    gap: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h2,
    flex: 1,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  modelInfo: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: SPACING.lg,
  },
  modelHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.md,
  },
  modelName: {
    ...TYPOGRAPHY.body,
    color: colors.text,
  },
  modelStatus: {
    ...TYPOGRAPHY.label,
    textTransform: 'uppercase' as const,
    color: colors.primary,
    backgroundColor: `${colors.primary  }20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  removeButton: {
    borderColor: colors.error,
  },
  downloading: {
    alignItems: 'center' as const,
    padding: SPACING.lg,
  },
  downloadingText: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
    marginTop: SPACING.sm,
  },
  progressBar: {
    width: '100%' as const,
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    marginTop: SPACING.md,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%' as const,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  modelList: {
    gap: SPACING.sm,
  },
  selectLabel: {
    ...TYPOGRAPHY.label,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  modelOption: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modelOptionInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.xs,
  },
  modelOptionName: {
    ...TYPOGRAPHY.body,
    color: colors.text,
  },
  modelOptionSize: {
    ...TYPOGRAPHY.meta,
    color: colors.primary,
  },
  modelOptionDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textMuted,
    lineHeight: 18,
  },
  error: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.error,
    marginTop: SPACING.md,
    textAlign: 'center' as const,
  },
  privacyCard: {
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: SPACING.md,
  },
  privacyTitle: {
    ...TYPOGRAPHY.h3,
    color: colors.text,
    marginBottom: SPACING.sm,
  },
  privacyText: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
