import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors, ThemeShadows } from '../../theme';
import { SPACING, TYPOGRAPHY } from '../../constants';
import { PRO_URL } from '../../utils/proPrompt';
import { useAppStore } from '../../stores';

const INTEGRATIONS_ICONS = ['mic', 'calendar', 'mail', 'message-square'];

export const ProDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const setHasRegisteredPro = useAppStore((s) => s.setHasRegisteredPro);

  const INTEGRATIONS = [
    { icon: INTEGRATIONS_ICONS[0], title: t('proDetail.voice'), desc: t('proDetail.voiceDesc') },
    { icon: INTEGRATIONS_ICONS[1], title: t('proDetail.calendar'), desc: t('proDetail.calendarDesc') },
    { icon: INTEGRATIONS_ICONS[2], title: t('proDetail.email'), desc: t('proDetail.emailDesc') },
    { icon: INTEGRATIONS_ICONS[3], title: t('proDetail.messaging'), desc: t('proDetail.messagingDesc') },
  ];

  const handleCTA = () => {
    setHasRegisteredPro(true);
    Linking.openURL(PRO_URL);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoGrid}>
              <View style={styles.logoDotRow}>
                <View style={styles.logoDot} />
                <View style={styles.logoDot} />
              </View>
              <View style={styles.logoDotRow}>
                <View style={styles.logoDot} />
                <View style={styles.logoDot} />
              </View>
            </View>
            <Text style={styles.logoText}>Off Grid Pro</Text>
          </View>
          <TouchableOpacity style={styles.getProButton} onPress={handleCTA}>
            <Text style={styles.getProButtonText}>{t('proDetail.getPro')}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{t('proDetail.heroTitle')}</Text>
          <Text style={styles.heroPrimary}>{t('proDetail.heroPrimary')}</Text>
          <Text style={styles.heroSubtitle}>{t('proDetail.heroSubtitle')}</Text>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBannerWrapper}>
          <LinearGradient
            colors={['#2D4A38', '#1C2B22', '#141F19']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.promoOfferRow}>
            <Icon name="star" size={13} color={colors.primary} />
            <Text style={styles.promoOfferLabel}>{t('proDetail.limitedTimeOffer')}</Text>
          </View>
          <Text style={styles.promoTitle}>{t('proDetail.lifetimeAccess')}</Text>
          <Text style={styles.promoSubtitle}>{t('proDetail.unlockAllIntegrations')}</Text>
        </View>

        {/* Core Integrations */}
        <View style={styles.integrationsSection}>
          <Text style={styles.sectionLabel}>{t('proDetail.coreIntegrations')}</Text>

          <View style={styles.gridRow}>
            {INTEGRATIONS.slice(0, 2).map(item => (
              <View key={item.title} style={styles.gridCard}>
                <View style={styles.gridIconWrap}>
                  <Icon name={item.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.gridCardTitle}>{item.title}</Text>
                <Text style={styles.gridCardDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>

          <View style={styles.gridRow}>
            {INTEGRATIONS.slice(2, 4).map(item => (
              <View key={item.title} style={styles.gridCard}>
                <View style={styles.gridIconWrap}>
                  <Icon name={item.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.gridCardTitle}>{item.title}</Text>
                <Text style={styles.gridCardDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>

          {/* MCP Access full-width */}
          <View style={styles.mcpCard}>
            <LinearGradient
              colors={isDark ? ['#141414', '#141414', '#1A2B1E'] : ['#FFFFFF', '#FFFFFF', '#E8F5EE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.mcpIconWrap}>
              <Icon name="cpu" size={20} color={colors.primary} />
            </View>
            <View style={styles.mcpContent}>
              <View style={styles.mcpTitleRow}>
                <Text style={styles.mcpTitle}>{t('proDetail.mcpAccess')}</Text>
                <View style={styles.advancedBadge}>
                  <Text style={styles.advancedBadgeText}>{t('proDetail.advanced')}</Text>
                </View>
              </View>
              <Text style={styles.mcpDesc}>{t('proDetail.mcpDesc')}</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} onPress={handleCTA}>
          <Text style={styles.ctaText}>{t('proDetail.iAmIn')}</Text>
          <Icon name="zap" size={16} color="#FFFFFF" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors, shadows: ThemeShadows) => ({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: SPACING.xxl,
  },

  // Header
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  logoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.sm,
  },
  logoGrid: { gap: 3 },
  logoDotRow: { flexDirection: 'row' as const, gap: 3 },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  logoText: { ...TYPOGRAPHY.body, color: colors.text },
  getProButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  getProButtonText: { ...TYPOGRAPHY.bodySmall, color: '#FFFFFF' },

  // Hero
  hero: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    alignItems: 'center' as const,
  },
  heroTitle: {
    ...TYPOGRAPHY.h1,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: SPACING.xs,
  },
  heroPrimary: {
    ...TYPOGRAPHY.h1,
    color: colors.primary,
    textAlign: 'center' as const,
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },

  // Promo Banner — fixed dark-green branded surface
  promoBannerWrapper: {
    alignSelf: 'stretch' as const,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    borderRadius: 16,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    overflow: 'hidden' as const,
  },
  promoOfferRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  promoOfferLabel: {
    ...TYPOGRAPHY.label,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  promoTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: SPACING.xs,
  },
  promoSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center' as const,
    lineHeight: 18,
  },

  // Integrations grid
  integrationsSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: colors.textMuted,
    letterSpacing: 1,
    textAlign: 'center' as const,
    marginBottom: SPACING.md,
  },
  gridRow: {
    flexDirection: 'row' as const,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center' as const,
    ...shadows.small,
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: SPACING.sm,
  },
  gridCardTitle: {
    ...TYPOGRAPHY.body,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: SPACING.xs,
  },
  gridCardDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 18,
  },

  // MCP Card
  mcpCard: {
    flexDirection: 'row' as const,
    borderRadius: 12,
    padding: SPACING.lg,
    gap: SPACING.md,
    alignItems: 'flex-start' as const,
    overflow: 'hidden' as const,
    ...shadows.small,
  },
  mcpIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  mcpContent: {
    flex: 1,
  },
  mcpTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
    flexWrap: 'wrap' as const,
  },
  mcpTitle: {
    ...TYPOGRAPHY.body,
    color: colors.text,
  },
  advancedBadge: {
    borderRadius: 4,
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  advancedBadgeText: {
    ...TYPOGRAPHY.labelSmall,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  mcpDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // CTA
  ctaButton: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: SPACING.sm,
  },
  ctaText: {
    ...TYPOGRAPHY.body,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

});
