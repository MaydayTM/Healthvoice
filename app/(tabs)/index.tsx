import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../stores/appStore';
import { useLogs } from '../../hooks/useLogs';
import { useRecording } from '../../hooks/useRecording';
import { VoiceButton } from '../../components/VoiceButton';
import { LogItem } from '../../components/LogItem';
import { ClarifyModal } from '../../components/ClarifyModal';
import { EditModal } from '../../components/EditModal';
import { HealthLog } from '../../types';
import { colors, typography, shadows } from '../../constants/theme';

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Vandaag';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Gisteren';
  } else {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
}

export default function TimelineScreen() {
  const {
    user,
    isLoading,
    recordingState,
    currentTranscript,
    processingError,
    pendingClarification,
  } = useAppStore();

  const {
    logs,
    fetchLogs,
    getLogsGroupedByDate,
    editLog,
    removeLog,
  } = useLogs();

  const {
    start: startRecording,
    stop: stopRecording,
    submitClarification,
    dismissClarification,
  } = useRecording();

  const [refreshing, setRefreshing] = React.useState(false);
  const [editingLog, setEditingLog] = React.useState<HealthLog | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  }, [fetchLogs]);

  const groupedLogs = getLogsGroupedByDate();

  // Debug: log user ID to console
  useEffect(() => {
    if (user) {
      console.log('=== USER ID ===', user.id);
    }
  }, [user]);

  const handleEdit = (log: HealthLog) => {
    setEditingLog(log);
  };

  const handleSaveEdit = async (logId: string, updates: Partial<HealthLog>) => {
    await editLog(logId, updates);
    setEditingLog(null);
  };

  const handleDelete = async (log: HealthLog) => {
    // TODO: Add confirmation dialog
    await removeLog(log.id);
  };

  const renderLogItem = ({ item }: { item: HealthLog }) => (
    <LogItem
      log={item}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  const renderDateHeader = (date: string) => (
    <View style={styles.dateHeader}>
      <View style={styles.dateLine} />
      <Text style={styles.dateHeaderText}>{formatDateHeader(date)}</Text>
      <View style={styles.dateLine} />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Nog geen logs</Text>
      <Text style={styles.emptyStateText}>
        Druk op de knop hieronder en{'\n'}spreek in wat je wilt loggen.
      </Text>
    </View>
  );

  // Flatten grouped logs for FlatList
  const flattenedData = React.useMemo(() => {
    const result: Array<{ type: 'header' | 'log'; date?: string; log?: HealthLog }> = [];

    groupedLogs.forEach(({ date, logs: dateLogs }) => {
      result.push({ type: 'header', date });
      dateLogs.forEach((log) => {
        result.push({ type: 'log', log });
      });
    });

    return result;
  }, [groupedLogs]);

  const renderItem = ({ item }: { item: typeof flattenedData[0] }) => {
    if (item.type === 'header' && item.date) {
      return renderDateHeader(item.date);
    }
    if (item.type === 'log' && item.log) {
      return renderLogItem({ item: item.log });
    }
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ink[400]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.brandLabel}>HEALTHVOICE</Text>
        </View>
        <Text style={styles.title}>Tijdlijn</Text>
        {user?.display_name && (
          <Text style={styles.subtitle}>
            Welkom, {user.display_name}
          </Text>
        )}
      </View>

      {/* Processing indicator */}
      {(recordingState === 'processing' || currentTranscript) && (
        <View style={styles.processingBanner}>
          {recordingState === 'processing' ? (
            <>
              <ActivityIndicator size="small" color={colors.amber[700]} />
              <Text style={styles.processingText}>Verwerken...</Text>
            </>
          ) : (
            <Text style={styles.transcriptText} numberOfLines={1}>
              "{currentTranscript}"
            </Text>
          )}
        </View>
      )}

      {/* Error banner */}
      {processingError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{processingError}</Text>
        </View>
      )}

      {/* Logs list */}
      <FlatList
        data={flattenedData}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'header' ? `header-${item.date}` : `log-${item.log?.id || index}`
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          flattenedData.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.ink[400]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Voice button */}
      <View style={styles.voiceButtonContainer}>
        <View style={styles.voiceButtonWrapper}>
          <VoiceButton
            state={recordingState}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            size={68}
          />
        </View>
        <Text style={styles.voiceHint}>
          {recordingState === 'idle'
            ? 'Houd ingedrukt om te spreken'
            : recordingState === 'recording'
            ? 'Laat los om te verwerken'
            : recordingState === 'processing'
            ? 'Even geduld...'
            : recordingState === 'success'
            ? 'Opgeslagen!'
            : 'Probeer opnieuw'}
        </Text>
      </View>

      {/* Clarification modal */}
      <ClarifyModal
        visible={pendingClarification !== null}
        clarification={pendingClarification}
        transcript={currentTranscript}
        onSubmit={submitClarification}
        onDismiss={dismissClarification}
      />

      {/* Edit modal */}
      <EditModal
        visible={editingLog !== null}
        log={editingLog}
        onSave={handleSaveEdit}
        onDismiss={() => setEditingLog(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper.DEFAULT,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink[100],
  },
  headerTop: {
    marginBottom: 4,
  },
  brandLabel: {
    ...typography.micro,
    color: colors.ink[400],
  },
  title: {
    ...typography.headline,
    fontSize: 36,
    color: colors.ink[800],
    fontWeight: '300',
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.ink[400],
    marginTop: 2,
  },
  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.amber[50],
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.amber[100],
  },
  processingText: {
    ...typography.body,
    fontSize: 14,
    color: colors.amber[800],
    fontWeight: '500',
  },
  transcriptText: {
    ...typography.body,
    fontSize: 14,
    color: colors.amber[800],
    fontStyle: 'italic',
  },
  errorBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(185, 28, 28, 0.08)',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.15)',
  },
  errorText: {
    ...typography.body,
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 200,
  },
  emptyListContent: {
    flex: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ink[100],
  },
  dateHeaderText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.ink[400],
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  emptyStateTitle: {
    ...typography.title,
    fontSize: 22,
    color: colors.ink[700],
    marginBottom: 8,
    fontWeight: '400',
  },
  emptyStateText: {
    ...typography.body,
    fontSize: 15,
    color: colors.ink[400],
    textAlign: 'center',
    lineHeight: 24,
  },
  voiceButtonContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  voiceButtonWrapper: {
    padding: 4,
    borderRadius: 100,
    backgroundColor: 'rgba(253, 252, 248, 0.9)',
    ...shadows.glass,
  },
  voiceHint: {
    marginTop: 12,
    ...typography.caption,
    fontSize: 11,
    color: colors.ink[400],
    letterSpacing: 0.5,
  },
});
