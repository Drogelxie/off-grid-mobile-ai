/**
 * Remote Server Configuration Modal
 *
 * Modal for adding and editing remote LLM server configurations.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme, useThemedStyles } from '../../theme';
import { AppSheet } from '../AppSheet';
import { CustomAlert } from '../CustomAlert';
import { RemoteServer } from '../../types';
import { createStyles } from './styles';
import { useRemoteServerForm } from './useRemoteServerForm';

interface RemoteServerModalProps {
  visible: boolean;
  onClose: () => void;
  server?: RemoteServer; // For editing existing server
  onSave?: (server: RemoteServer) => void;
}

interface TestResultSectionProps {
  testResult: { success: boolean; message: string } | null;
  discoveredModels: Array<{ id: string; name: string }>;
  styles: ReturnType<typeof createStyles>;
}

const TestResultSection: React.FC<TestResultSectionProps> = ({ testResult, discoveredModels, styles }) => {
  const { t } = useTranslation();
  return (
    <>
      {testResult && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, testResult.success ? styles.statusDotSuccess : styles.statusDotError]} />
          <Text style={styles.statusText}>{testResult.message}</Text>
        </View>
      )}
      {discoveredModels.length > 0 && (
        <View style={styles.modelList}>
          <Text style={styles.sectionHeader}>{t('addServerModal.discoveredModels')}</Text>
          <ScrollView style={styles.modelScroll} nestedScrollEnabled>
            {discoveredModels.map((model) => (
              <View key={model.id} style={styles.modelItem}>
                <Text style={styles.modelName}>{model.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

const EndpointHelpPanel: React.FC<{ styles: ReturnType<typeof createStyles> }> = ({ styles }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.helpPanel}>
      <View style={styles.helpScenario}>
        <View style={styles.helpScenarioHeader}>
          <Icon name="wifi" size={13} color={theme.colors.secondary} />
          <Text style={styles.helpScenarioTitle}>{t('addServerModal.helpWifiTitle')}</Text>
        </View>
        <Text style={styles.helpStep}>{t('addServerModal.helpWifiStep1')}</Text>
        <Text style={styles.helpStep}>{t('addServerModal.helpWifiWindows')}</Text>
        <Text style={styles.helpStep}>{t('addServerModal.helpWifiMac')}</Text>
        <Text style={styles.helpStep}>{t('addServerModal.helpWifiStep2')}</Text>
        <Text style={styles.helpStep}>{t('addServerModal.helpWifiOllama')}</Text>
        <Text style={styles.helpStep}>{t('addServerModal.helpWifiLmStudio')}</Text>
      </View>

      <View style={styles.helpDivider} />

      <View style={styles.helpScenario}>
        <View style={styles.helpScenarioHeader}>
          <Icon name="shield" size={13} color={theme.colors.info} />
          <Text style={styles.helpScenarioTitle}>{t('addServerModal.helpTailscaleTitle')}</Text>
        </View>
        <Text style={styles.helpStep}>{t('addServerModal.helpTailscaleStep1')}</Text>
        <Text style={styles.helpStep}>{t('addServerModal.helpTailscaleStep2')}</Text>
        <Text style={styles.helpStep}>{t('addServerModal.helpTailscaleStep3')}</Text>
        <Text style={styles.helpStep}>{t('addServerModal.helpTailscaleStep4')}</Text>
        <Text style={styles.helpStep}>{t('addServerModal.helpTailscaleNote')}</Text>
      </View>
    </View>
  );
};

export const RemoteServerModal: React.FC<RemoteServerModalProps> = ({
  visible,
  onClose,
  server,
  onSave,
}) => {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const [showApiKey, setShowApiKey] = useState(false);
  const [showEndpointHelp, setShowEndpointHelp] = useState(false);

  const {
    name, setName,
    endpoint, setEndpoint,
    apiKey, setApiKey,
    notes, setNotes,
    errors,
    isTesting,
    testResult,
    discoveredModels,
    handleTestConnection,
    handleSave,
    isPublicNetwork,
    alertState,
    dismissAlert,
  } = useRemoteServerForm({ server, visible, onSave, onClose });

  const handleDonePress = () => {
    if (testResult?.success) {
      handleSave();
      return;
    }
    onClose();
  };

  return (
    <AppSheet
      visible={visible}
      onClose={onClose}
      onHeaderClosePress={handleDonePress}
      title={server ? t('addServerModal.editTitle') : t('addServerModal.addTitle')}
      closeLabel={t('addServerModal.done')}
      snapPoints={['80%']}
      enableDynamicSizing
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>{t('addServerModal.serverNameLabel')}</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder={t('addServerModal.serverNamePlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>{t('addServerModal.endpointLabel')}</Text>
        <TextInput
          style={[styles.input, errors.endpoint && styles.inputError]}
          placeholder={t('addServerModal.endpointPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={endpoint}
          onChangeText={setEndpoint}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        {errors.endpoint && <Text style={styles.errorText}>{errors.endpoint}</Text>}
        {isPublicNetwork && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              {t('addServerModal.publicNetworkWarning')}
            </Text>
          </View>
        )}
        <Text style={styles.helperText}>
          {endpoint.trim()
            ? t('addServerModal.endpointWillConnect', { url: endpoint.trim().replace(/\/+$/, '') })
            : t('addServerModal.endpointHelper')}
        </Text>
        <TouchableOpacity
          style={styles.helpToggle}
          onPress={() => setShowEndpointHelp(v => !v)}
        >
          <Icon
            name={showEndpointHelp ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={theme.colors.primary}
          />
          <Text style={styles.helpToggleText}>
            {showEndpointHelp ? t('addServerModal.helpToggleHide') : t('addServerModal.helpToggleShow')}
          </Text>
        </TouchableOpacity>
        {showEndpointHelp && <EndpointHelpPanel styles={styles} />}

        <Text style={styles.label}>{t('addServerModal.apiKeyLabel')}</Text>
        <View style={styles.apiKeyContainer}>
          <TextInput
            style={[styles.input, styles.apiKeyInput]}
            placeholder={t('addServerModal.apiKeyPlaceholder')}
            placeholderTextColor={theme.colors.textMuted}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!showApiKey}
          />
          <TouchableOpacity style={styles.apiKeyToggle} onPress={() => setShowApiKey(v => !v)}>
            <Icon name={showApiKey ? 'eye-off' : 'eye'} size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>
          {t('addServerModal.apiKeyHelper')}
        </Text>

        <Text style={styles.label}>{t('addServerModal.notesLabel')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder={t('addServerModal.notesPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <TestResultSection testResult={testResult} discoveredModels={discoveredModels} styles={styles} />
        {!testResult?.success && (
          <Text style={styles.helperText}>
            {t('addServerModal.testFirst', { action: server ? t('addServerModal.updateServer') : t('addServerModal.addServer') })}
          </Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.testButton, isTesting && styles.testButtonDisabled]}
            onPress={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <ActivityIndicator size="small" color={theme.colors.background} />
            ) : (
              <Text style={[styles.testButtonText, isTesting && styles.testButtonTextDisabled]}>
                {t('addServerModal.testConnection')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !testResult?.success && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!testResult?.success}
          >
            <Text style={[styles.saveButtonText, !testResult?.success && styles.saveButtonTextDisabled]}>
              {server ? t('addServerModal.updateServer') : t('addServerModal.addServer')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert {...alertState} onClose={dismissAlert} />
    </AppSheet>
  );
};
