/**
 * Remote Servers Settings Screen
 *
 * Manage connections to remote LLM servers (Ollama, LM Studio, etc.)
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme, useThemedStyles } from '../theme';
import { useRemoteServerStore } from '../stores';
import { RemoteServerModal } from '../components/RemoteServerModal';
import { RootStackParamList } from '../navigation/types';
import { remoteServerManager } from '../services/remoteServerManager';
import { discoverLANServers } from '../services/networkDiscovery';
import { CustomAlert, AlertState, initialAlertState, showAlert } from '../components/CustomAlert';
import { OFF_GRID_DESKTOP_URL } from '../constants';
import { withUtm } from '../utils/utm';
import { createStyles } from './RemoteServersScreen.styles';

const DESKTOP_URL = withUtm(OFF_GRID_DESKTOP_URL, 'remote-servers');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RemoteServers'>;

export const RemoteServersScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { servers, serverHealth, testConnection, activeServerId, setActiveServerId } = useRemoteServerStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServer, setEditingServer] = useState<typeof servers[0] | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [alertState, setAlertState] = useState<AlertState>(initialAlertState);

  // Auto-check all server statuses when screen opens
  useEffect(() => {
    servers.forEach(server => {
      testConnection(server.id).catch(() => { });
    });

  }, []);

  const handleTestServer = useCallback(async (serverId: string) => {
    setTestingId(serverId);
    try {
      const result = await testConnection(serverId);
      if (result.success) {
        setAlertState(showAlert(t('common.success'), t('remoteServers.successMessage', { latency: result.latency })));
      } else {
        setAlertState(showAlert(t('remoteServers.connectionFailed'), result.error || t('remoteServers.unknown')));
      }
    } catch (error) {
      setAlertState(showAlert(t('common.error'), error instanceof Error ? error.message : t('remoteServers.unknown')));
    } finally {
      setTestingId(null);
    }
  }, [testConnection, t]);

  const handleScanNetwork = useCallback(async () => {
    setIsScanning(true);
    try {
      const discovered = await discoverLANServers();
      if (discovered.length === 0) {
        setAlertState(showAlert(
          'No Servers Found',
          'No LLM servers were found on your local network. Run Off Grid AI Desktop on your Mac to serve its models here.',
          [
            { text: 'Dismiss', style: 'cancel' },
            { text: 'Get Off Grid AI Desktop', onPress: () => Linking.openURL(DESKTOP_URL).catch(() => {}) },
          ],
        ));
        return;
      }
      const existingEndpoints = new Set(servers.map(s => s.endpoint));
      const newServers = discovered.filter(d => !existingEndpoints.has(d.endpoint));
      if (newServers.length === 0) {
        setAlertState(showAlert(t('remoteServers.alreadyAddedTitle'), t('remoteServers.alreadyAdded')));
        return;
      }
      const added = await Promise.all(
        newServers.map(d =>
          remoteServerManager.addServer({
            name: d.name,
            endpoint: d.endpoint,
            providerType: 'openai-compatible',
          })
        )
      );
      added.forEach(s => remoteServerManager.testConnection(s.id).catch(() => { }));
      setAlertState(showAlert(t('remoteServers.discoveryCompleteTitle'), t('remoteServers.discoveryComplete', { count: newServers.length })));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('remoteServers.unknown');
      setAlertState(showAlert(t('remoteServers.scanFailed'), message));
    } finally {
      setIsScanning(false);
    }
  }, [servers, t]);

  const handleDeleteServer = useCallback((server: typeof servers[0]) => {
    setAlertState(showAlert(
      t('remoteServers.deleteTitle'),
      t('remoteServers.deleteConfirm', { name: server.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('remoteServers.delete'),
          style: 'destructive',
          onPress: async () => {
            if (activeServerId === server.id) setActiveServerId(null);
            await remoteServerManager.removeServer(server.id);
          },
        },
      ]
    ));
  }, [activeServerId, setActiveServerId, t]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('remoteServers.title')}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {servers.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="wifi" size={32} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>{t('remoteServers.noServers')}</Text>
            <Text style={styles.emptyText}>
              {t('remoteServers.connectDescription')}
            </Text>
            <TouchableOpacity
              style={styles.desktopLink}
              onPress={() => Linking.openURL(DESKTOP_URL).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel="Get Off Grid AI Desktop"
            >
              <Icon name="monitor" size={16} color={theme.colors.primary} />
              <Text style={styles.desktopLinkText}>Get Off Grid AI Desktop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Icon name="plus" size={20} color={theme.colors.background} />
              <Text style={styles.addButtonText}>{t('remoteServers.addServer')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanButton} onPress={handleScanNetwork} disabled={isScanning}>
              {isScanning ? (
                <ActivityIndicator size="small" color={theme.colors.text} />
              ) : (
                <Icon name="wifi" size={20} color={theme.colors.text} />
              )}
              <Text style={styles.scanButtonText}>{isScanning ? t('remoteServers.scanning') : t('remoteServers.scanNetwork')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {servers.map((server) => {
              const isTesting = testingId === server.id;
              const health = serverHealth[server.id];

              let statusColor = styles.statusDotUnknown;
              if (health?.isHealthy === true) statusColor = styles.statusDotActive;
              else if (health?.isHealthy === false) statusColor = styles.statusDotInactive;

              let statusText = t('remoteServers.unknown');
              if (isTesting) statusText = t('remoteServers.testing');
              else if (health?.isHealthy === true) statusText = t('remoteServers.connected');
              else if (health?.isHealthy === false) statusText = t('remoteServers.offline');

              return (
                <View key={server.id} style={styles.serverItem}>
                  <View style={styles.serverHeader}>
                    <View style={styles.serverInfo}>
                      <Text style={styles.serverName}>{server.name}</Text>
                      <Text style={styles.serverEndpoint}>{server.endpoint}</Text>
                    </View>
                  </View>

                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, statusColor]} />
                    <Text style={styles.statusText}>{statusText}</Text>
                  </View>

                  <View style={styles.serverActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleTestServer(server.id)}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <ActivityIndicator size="small" color={theme.colors.text} />
                      ) : (
                        <>
                          <Icon name="refresh-cw" size={16} color={theme.colors.text} />
                          <Text style={styles.actionButtonText}>{t('remoteServers.test')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setEditingServer(server)}
                    >
                      <Icon name="edit-2" size={16} color={theme.colors.text} />
                      <Text style={styles.actionButtonText}>{t('remoteServers.edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteServer(server)}
                    >
                      <Icon name="trash-2" size={16} color={theme.colors.error} />
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>{t('remoteServers.delete')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Icon name="plus" size={20} color={theme.colors.background} />
              <Text style={styles.addButtonText}>{t('remoteServers.addAnotherServer')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanButton} onPress={handleScanNetwork} disabled={isScanning}>
              {isScanning ? (
                <ActivityIndicator size="small" color={theme.colors.text} />
              ) : (
                <Icon name="wifi" size={20} color={theme.colors.text} />
              )}
              <Text style={styles.scanButtonText}>{isScanning ? t('remoteServers.scanning') : t('remoteServers.scanNetwork')}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Remote Servers</Text>
          <Text style={styles.infoText}>
            Connect to LLM servers running on your local network, such as Off Grid AI Desktop, Ollama, or LM Studio.{'\n\n'}
            Off Grid AI Desktop runs on your Mac and serves its models to this phone over your own network.{'\n\n'}
            Make sure your server is running and accessible from your device. For security, only connect to servers on trusted networks.
          </Text>
          <TouchableOpacity
            style={styles.desktopLink}
            onPress={() => Linking.openURL(DESKTOP_URL).catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel="Get Off Grid AI Desktop"
          >
            <Icon name="monitor" size={16} color={theme.colors.primary} />
            <Text style={styles.desktopLinkText}>Get Off Grid AI Desktop</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RemoteServerModal
        visible={showAddModal || !!editingServer}
        onClose={() => {
          setShowAddModal(false);
          setEditingServer(null);
        }}
        server={editingServer || undefined}
        onSave={() => {
          setShowAddModal(false);
          setEditingServer(null);
        }}
      />

      <CustomAlert
        {...alertState}
        onClose={() => setAlertState(initialAlertState)}
      />
    </SafeAreaView>
  );
};