import { useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { useAppStore } from '../stores/appStore';
import { startRecording, stopRecording, cancelRecording } from '../lib/audio';
import { transcribeAudio } from '../lib/whisper';
import { parseHealthLog, createHealthLog } from '../lib/supabase';
import { ExtractedItem, HealthLog } from '../types';

export function useRecording() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const {
    user,
    recordingState,
    setRecordingState,
    setCurrentTranscript,
    setProcessingError,
    setPendingClarification,
    setPendingItems,
    addLog,
  } = useAppStore();

  const start = useCallback(async () => {
    try {
      setProcessingError(null);
      setRecordingState('recording');

      const recording = await startRecording();
      if (!recording) {
        throw new Error('Failed to start recording');
      }

      recordingRef.current = recording;
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingState('error');
      setProcessingError('Kon opname niet starten. Controleer microfoon permissies.');

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setRecordingState('idle');
        setProcessingError(null);
      }, 2000);
    }
  }, [setRecordingState, setProcessingError]);

  const stop = useCallback(async () => {
    try {
      setRecordingState('processing');

      const result = await stopRecording();
      recordingRef.current = null;

      if (!result) {
        throw new Error('No recording result');
      }

      // Step 1: Transcribe audio
      console.log('Transcribing audio...');
      const transcription = await transcribeAudio(result.uri);
      setCurrentTranscript(transcription.text);

      // Step 2: Parse with Claude
      console.log('Parsing transcript:', transcription.text);
      const extraction = await parseHealthLog(transcription.text);

      // Step 3: Check for clarification needs
      if (extraction.needs_clarification) {
        setPendingClarification(extraction.needs_clarification);
        setPendingItems(extraction.items);
        setRecordingState('idle');
        return;
      }

      // Step 4: Save all extracted items
      if (extraction.items.length > 0 && user) {
        const savedLogs = await saveExtractedItems(
          extraction.items,
          user.id,
          transcription.text,
          result.duration_ms
        );

        // Add to store
        savedLogs.forEach((log) => {
          if (log) addLog(log);
        });
      }

      setRecordingState('success');

      // Reset to idle after 1.5 seconds
      setTimeout(() => {
        setRecordingState('idle');
        setCurrentTranscript(null);
      }, 1500);
    } catch (error) {
      console.error('Error processing recording:', error);
      setRecordingState('error');
      setProcessingError(
        error instanceof Error ? error.message : 'Er ging iets mis bij het verwerken'
      );

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setRecordingState('idle');
        setProcessingError(null);
        setCurrentTranscript(null);
      }, 2000);
    }
  }, [
    user,
    setRecordingState,
    setCurrentTranscript,
    setProcessingError,
    setPendingClarification,
    setPendingItems,
    addLog,
  ]);

  const cancel = useCallback(async () => {
    await cancelRecording();
    recordingRef.current = null;
    setRecordingState('idle');
    setCurrentTranscript(null);
  }, [setRecordingState, setCurrentTranscript]);

  const submitClarification = useCallback(
    async (answer: string) => {
      const { pendingClarification, currentTranscript, pendingItems } =
        useAppStore.getState();

      if (!pendingClarification || !currentTranscript || !user) {
        return;
      }

      try {
        setRecordingState('processing');

        // Re-parse with clarification
        const extraction = await parseHealthLog(currentTranscript, {
          field: pendingClarification.field,
          answer,
        });

        // Clear clarification state
        setPendingClarification(null);

        // Merge with pending items if any
        const allItems = [...pendingItems, ...extraction.items];

        // Save all items
        if (allItems.length > 0) {
          const savedLogs = await saveExtractedItems(
            allItems,
            user.id,
            currentTranscript,
            null
          );

          savedLogs.forEach((log) => {
            if (log) addLog(log);
          });
        }

        setPendingItems([]);
        setRecordingState('success');

        setTimeout(() => {
          setRecordingState('idle');
          setCurrentTranscript(null);
        }, 1500);
      } catch (error) {
        console.error('Error submitting clarification:', error);
        setRecordingState('error');
        setProcessingError('Kon verduidelijking niet verwerken');

        setTimeout(() => {
          setRecordingState('idle');
          setProcessingError(null);
        }, 2000);
      }
    },
    [
      user,
      setRecordingState,
      setCurrentTranscript,
      setProcessingError,
      setPendingClarification,
      setPendingItems,
      addLog,
    ]
  );

  const dismissClarification = useCallback(() => {
    const { pendingItems } = useAppStore.getState();

    // Save pending items without clarification
    if (pendingItems.length > 0 && user) {
      saveExtractedItems(
        pendingItems,
        user.id,
        useAppStore.getState().currentTranscript || '',
        null
      ).then((savedLogs) => {
        savedLogs.forEach((log) => {
          if (log) addLog(log);
        });
      });
    }

    setPendingClarification(null);
    setPendingItems([]);
    setCurrentTranscript(null);
  }, [user, setPendingClarification, setPendingItems, setCurrentTranscript, addLog]);

  return {
    state: recordingState,
    start,
    stop,
    cancel,
    submitClarification,
    dismissClarification,
  };
}

// Helper function to save extracted items
async function saveExtractedItems(
  items: ExtractedItem[],
  userId: string,
  rawTranscript: string,
  audioDurationMs: number | null
): Promise<(HealthLog | null)[]> {
  const promises = items.map((item) =>
    createHealthLog({
      user_id: userId,
      logged_at: new Date().toISOString(),
      raw_transcript: item.original_text,
      audio_duration_ms: audioDurationMs,
      category: item.category,
      subcategory: item.subcategory,
      content: item.content,
      confidence_score: item.confidence,
      was_edited: false,
      apple_health_synced: false,
    })
  );

  return Promise.all(promises);
}
