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

const TestResultSection: React.FC<TestResultSectionProps> = ({ testResult, discoveredModels, styles }) => (
  <>
    {testResult && (
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, testResult.success ? styles.statusDotSuccess : styles.statusDotError]} />
        <Text style={styles.statusText}>{testResult.message}</Text>
      </View>
    )}
    {discoveredModels.length > 0 && (
      <View style={styles.modelList}>
        <Text style={styles.sectionHeader}>Discovered Models</Text>
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

const EndpointHelpPanel: React.FC<{ styles: ReturnType<typeof createStyles> }> = ({ styles }) => {
  const theme = useTheme();
  return (
    <View style={styles.helpPanel}>
      <View style={styles.helpScenario}>
        <View style={styles.helpScenarioHeader}>
          <Icon name="wifi" size={13} color={theme.colors.secondary} />
          <Text style={styles.helpScenarioTitle}>Same WiFi network</Text>
        </View>
        <Text style={styles.helpStep}>1. Find your PC's local IP address:</Text>
        <Text style={styles.helpStep}>{'   '}Windows: open Command Prompt, run <Text style={styles.helpCode}>ipconfig</Text> - look for IPv4 Address</Text>
        <Text style={styles.helpStep}>{'   '}Mac / Linux: run <Text style={styles.helpCode}>ip addr</Text> or <Text style={styles.helpCode}>ifconfig</Text></Text>
        <Text style={styles.helpStep}>2. Use that IP with the server port:</Text>
        <Text style={styles.helpStep}>{'   '}Ollama: <Text style={styles.helpCode}>http://192.168.1.X:11434</Text></Text>
        <Text style={styles.helpStep}>{'   '}LM Studio: <Text style={styles.helpCode}>http://192.168.1.X:1234</Text></Text>
      </View>

      <View style={styles.helpDivider} />

      <View style={styles.helpScenario}>
        <View style={styles.helpScenarioHeader}>
          <Icon name="shield" size={13} color={theme.colors.info} />
          <Text style={styles.helpScenarioTitle}>Outside your home - secure with Tailscale</Text>
        </View>
        <Text style={styles.helpStep}>1. Install Tailscale on your PC and this phone (tailscale.com - free)</Text>
        <Text style={styles.helpStep}>2. Sign in with the same account on both devices</Text>
        <Text style={styles.helpStep}>3. Your PC gets a Tailscale IP starting with <Text style={styles.helpCode}>100.</Text></Text>
        <Text style={styles.helpStep}>4. Use that IP here: <Text style={styles.helpCode}>http://100.X.X.X:11434</Text></Text>
        <Text style={styles.helpStep}>{'   '}Connection is encrypted via WireGuard. No port forwarding needed.</Text>
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
      title={server ? 'Edit Server' : 'Add Remote Server'}
      closeLabel="Done"
      snapPoints={['80%']}
      enableDynamicSizing
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Server Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="e.g., Ollama Desktop"
          placeholderTextColor={theme.colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Endpoint URL</Text>
        <TextInput
          style={[styles.input, errors.endpoint && styles.inputError]}
          placeholder="http://192.168.1.50:11434"
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
              ⚠️ This endpoint is on the public internet. Your data will be sent to a remote server.
            </Text>
          </View>
        )}
        <Text style={styles.helperText}>
          {endpoint.trim()
            ? `Will connect to: ${endpoint.trim().replace(/\/+$/, '')}/v1/models`
            : 'Enter the base URL — /v1/models will be appended automatically'}
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
            {showEndpointHelp ? 'Hide setup help' : 'How do I find the address?'}
          </Text>
        </TouchableOpacity>
        {showEndpointHelp && <EndpointHelpPanel styles={styles} />}

        <Text style={styles.label}>API Key (Optional)</Text>
        <View style={styles.apiKeyContainer}>
          <TextInput
            style={[styles.input, styles.apiKeyInput]}
            placeholder="sk-..."
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
          Stored in the device keychain. Required for some servers - check your server's settings.
        </Text>

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Add notes about this server..."
          placeholderTextColor={theme.colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <TestResultSection testResult={testResult} discoveredModels={discoveredModels} styles={styles} />
        {!testResult?.success && (
          <Text style={styles.helperText}>
            Test connection first to enable {server ? 'Update Server' : 'Add Server'}.
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
                Test Connection
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !testResult?.success && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!testResult?.success}
          >
            <Text style={[styles.saveButtonText, !testResult?.success && styles.saveButtonTextDisabled]}>
              {server ? 'Update Server' : 'Add Server'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert {...alertState} onClose={dismissAlert} />
    </AppSheet>
  );
};

export default RemoteServerModal;
