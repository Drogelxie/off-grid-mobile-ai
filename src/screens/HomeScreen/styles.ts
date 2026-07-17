import type { ThemeColors, ThemeShadows } from '../../theme';
import { TYPOGRAPHY, SPACING } from '../../constants';

const createLayoutStyles = (colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 24,
    paddingTop: 4,
  },
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  crownButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: `${colors.accent}18`,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: colors.text,
    letterSpacing: -1,
  },
  titleAccent: {
    color: colors.primary,
  },
});

const createModelCardStyles = (colors: ThemeColors, shadows: ThemeShadows) => ({
  modelsRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 20,
  },
  modelCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  modelCardTextActive: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  modelCardImageActive: {
    borderColor: colors.secondary,
    borderWidth: 1.5,
  },
  modelCardAccentBar: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: colors.primary,
  },
  modelCardAccentBarImage: {
    backgroundColor: colors.secondary,
  },
  modelCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 8,
    marginTop: 8,
  },
  modelCardLabel: {
    ...TYPOGRAPHY.labelSmall,
    flex: 1,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  modelCardLabelActive: {
    color: colors.primary,
  },
  modelCardLabelImageActive: {
    color: colors.secondary,
  },
  modelCardName: {
    ...TYPOGRAPHY.h3,
    color: colors.text,
    flex: 1,
  },
  modelCardNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  remoteBadge: {
    backgroundColor: `${colors.info}20`,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  remoteBadgeText: {
    ...TYPOGRAPHY.metaSmall,
    color: colors.info,
    letterSpacing: 0.3,
  },
  modelCardMeta: {
    ...TYPOGRAPHY.meta,
    color: colors.textMuted,
    marginTop: 3,
  },
  modelCardEmpty: {
    ...TYPOGRAPHY.h3,
    color: colors.textMuted,
  },
  modelCardLoading: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.primary,
    marginTop: 2,
  },
  ejectAllButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 13,
    marginBottom: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${colors.error}40`,
    backgroundColor: `${colors.error}08`,
  },
  ejectAllText: {
    ...TYPOGRAPHY.body,
    color: colors.error,
  },
  newChatButton: {
    marginBottom: 20,
  },
});

const createSectionStyles = (colors: ThemeColors, shadows: ThemeShadows) => ({
  galleryCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  galleryCardInfo: {
    flex: 1,
  },
  galleryCardTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600' as const,
    color: colors.text,
  },
  galleryCardMeta: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  desktopCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 10,
    ...shadows.small,
  },
  desktopCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  desktopCardTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
  desktopBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  desktopBadgeText: {
    ...TYPOGRAPHY.metaSmall,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  desktopCardBody: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textSecondary,
  },
  desktopCardCtaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  desktopCardCta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  desktopCardCtaText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  desktopCardCopy: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  desktopCardCopyText: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.textSecondary,
  },
  setupCard: {
    alignItems: 'center' as const,
    padding: 20,
    marginBottom: 20,
    gap: 12,
  },
  setupActions: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  setupText: {
    ...TYPOGRAPHY.body,
    color: colors.textMuted,
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: colors.text,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  sectionTitleDot: {
    color: colors.primary,
  },
  seeAll: {
    ...TYPOGRAPHY.meta,
    color: colors.primary,
  },
  conversationItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  conversationTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: colors.text,
    flex: 1,
    marginRight: SPACING.sm,
    fontWeight: '500' as const,
  },
  conversationMeta: {
    ...TYPOGRAPHY.metaSmall,
    color: colors.textMuted,
  },
  conversationPreview: {
    ...TYPOGRAPHY.meta,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteAction: {
    backgroundColor: colors.errorBackground,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    width: 48,
    borderRadius: 14,
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row' as const,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    ...TYPOGRAPHY.display,
    color: colors.primary,
    letterSpacing: -1.5,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSmall,
    color: colors.textMuted,
    marginTop: SPACING.xs,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  swipeableContainer: {
    overflow: 'visible' as const,
  },
});

const createPickerStyles = (colors: ThemeColors) => ({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%' as const,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
  },
  modalScroll: {
    padding: 16,
  },
  pickerItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerItemActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  pickerItemInfo: {
    flex: 1,
  },
  pickerItemName: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  pickerItemMeta: {
    ...TYPOGRAPHY.h3,
    color: colors.textMuted,
    marginTop: 2,
  },
  pickerItemMemory: {
    ...TYPOGRAPHY.meta,
    color: colors.textMuted,
    marginTop: 2,
  },
  pickerItemMemoryWarning: {
    color: colors.warning,
  },
  pickerItemWarning: {
    borderWidth: 1,
    borderColor: colors.warning,
  },
  unloadButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.error}40`,
    gap: 8,
  },
  unloadButtonText: {
    ...TYPOGRAPHY.body,
    color: colors.error,
  },
  emptyPicker: {
    alignItems: 'center' as const,
    padding: 24,
    gap: 12,
  },
  emptyPickerText: {
    ...TYPOGRAPHY.body,
    color: colors.textMuted,
  },
  sectionLabel: {
    ...TYPOGRAPHY.labelSmall,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  browseMoreButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  browseMoreText: {
    ...TYPOGRAPHY.body,
    color: colors.primary,
  },
});

export const createStyles = (colors: ThemeColors, shadows: ThemeShadows) => ({
  ...createLayoutStyles(colors),
  ...createModelCardStyles(colors, shadows),
  ...createSectionStyles(colors, shadows),
  ...createPickerStyles(colors),
});
