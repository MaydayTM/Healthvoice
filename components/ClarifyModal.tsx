import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { HelpCircle, X, Send } from 'lucide-react-native';
import { ClarificationRequest } from '../types';
import { colors, typography, shadows } from '../constants/theme';

interface ClarifyModalProps {
  visible: boolean;
  clarification: ClarificationRequest | null;
  transcript: string | null;
  onSubmit: (answer: string) => void;
  onDismiss: () => void;
}

export function ClarifyModal({
  visible,
  clarification,
  transcript,
  onSubmit,
  onDismiss,
}: ClarifyModalProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const handleDismiss = () => {
    setAnswer('');
    onDismiss();
  };

  if (!clarification) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={handleDismiss} />

        <View style={styles.content}>
          {/* Drag indicator */}
          <View style={styles.dragIndicator} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <HelpCircle size={22} color={colors.amber[600]} strokeWidth={1.5} />
            </View>
            <Text style={styles.headerTitle}>Verduidelijking nodig</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={handleDismiss}
              hitSlop={8}
            >
              <X size={20} color={colors.ink[400]} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* Original transcript */}
          {transcript && (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>JOUW INPUT</Text>
              <Text style={styles.transcript}>"{transcript}"</Text>
            </View>
          )}

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>
              Veld: <Text style={styles.fieldName}>{clarification.field}</Text>
            </Text>
            <Text style={styles.question}>{clarification.question}</Text>
          </View>

          {/* Answer input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Typ je antwoord..."
              placeholderTextColor={colors.ink[300]}
              value={answer}
              onChangeText={setAnswer}
              multiline
              autoFocus
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />
            <Pressable
              style={[
                styles.submitButton,
                !answer.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!answer.trim()}
            >
              <Send size={18} color={answer.trim() ? colors.paper[100] : colors.ink[300]} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* Skip button */}
          <Pressable
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.skipButtonPressed,
            ]}
            onPress={handleDismiss}
          >
            <Text style={styles.skipButtonText}>
              Overslaan en toch opslaan
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 25, 23, 0.4)',
  },
  content: {
    backgroundColor: colors.paper[100],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: colors.ink[100],
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ink[200],
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.amber[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.amber[100],
  },
  headerTitle: {
    flex: 1,
    ...typography.title,
    fontSize: 18,
    color: colors.ink[700],
    fontWeight: '500',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  closeButtonPressed: {
    backgroundColor: colors.paper[200],
  },
  transcriptContainer: {
    backgroundColor: colors.paper[200],
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
  transcriptLabel: {
    ...typography.micro,
    fontSize: 9,
    color: colors.ink[400],
    marginBottom: 6,
  },
  transcript: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink[600],
    fontStyle: 'italic',
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionLabel: {
    ...typography.body,
    fontSize: 13,
    color: colors.ink[400],
    marginBottom: 8,
  },
  fieldName: {
    fontWeight: '600',
    color: colors.amber[700],
  },
  question: {
    ...typography.body,
    fontSize: 16,
    color: colors.ink[700],
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.paper[200],
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.ink[700],
    maxHeight: 100,
    paddingVertical: 8,
  },
  submitButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.ink[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.paper[300],
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  skipButtonPressed: {
    backgroundColor: colors.paper[200],
  },
  skipButtonText: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink[400],
  },
});
