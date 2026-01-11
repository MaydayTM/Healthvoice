import * as FileSystem from 'expo-file-system';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
  text: string;
  duration_ms: number;
}

export async function transcribeAudio(
  audioUri: string
): Promise<TranscriptionResult> {
  const startTime = Date.now();

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Read the audio file
  const audioInfo = await FileSystem.getInfoAsync(audioUri);
  if (!audioInfo.exists) {
    throw new Error('Audio file not found');
  }

  // Create form data for the API request
  const formData = new FormData();

  // Read file and create blob
  const response = await fetch(audioUri);
  const blob = await response.blob();

  // Append the audio file
  formData.append('file', blob, 'recording.m4a');
  formData.append('model', 'whisper-1');
  formData.append('language', 'nl'); // Dutch as default

  try {
    const apiResponse = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Whisper API error:', errorText);
      throw new Error(`Whisper API error: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    const duration_ms = Date.now() - startTime;

    return {
      text: result.text,
      duration_ms,
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}
