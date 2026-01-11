import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// High quality recording settings optimized for speech
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

let recording: Audio.Recording | null = null;

export async function requestPermissions(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
}

export async function startRecording(): Promise<Audio.Recording | null> {
  try {
    // Request permissions if not already granted
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission not granted');
    }

    // Configure audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create and start the recording
    const { recording: newRecording } = await Audio.Recording.createAsync(
      RECORDING_OPTIONS
    );

    recording = newRecording;
    return recording;
  } catch (error) {
    console.error('Error starting recording:', error);
    return null;
  }
}

export async function stopRecording(): Promise<{
  uri: string;
  duration_ms: number;
} | null> {
  try {
    if (!recording) {
      return null;
    }

    const status = await recording.getStatusAsync();
    await recording.stopAndUnloadAsync();

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    recording = null;

    if (!uri) {
      return null;
    }

    return {
      uri,
      duration_ms: status.durationMillis || 0,
    };
  } catch (error) {
    console.error('Error stopping recording:', error);
    recording = null;
    return null;
  }
}

export async function cancelRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Delete the file if it exists
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      recording = null;
    }

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
  } catch (error) {
    console.error('Error canceling recording:', error);
    recording = null;
  }
}

export function getRecording(): Audio.Recording | null {
  return recording;
}

export async function getRecordingDuration(): Promise<number> {
  if (!recording) return 0;

  try {
    const status = await recording.getStatusAsync();
    return status.durationMillis || 0;
  } catch {
    return 0;
  }
}
