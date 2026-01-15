import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Edit2, X, Check } from 'lucide-react-native';
import {
  HealthLog,
  Category,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_BG_COLORS,
  NutritionContent,
  SupplementContent,
  MovementContent,
  SleepContent,
  WellbeingContent,
  OtherContent,
  HealthLogContent,
} from '../types';
import { colors, typography, shadows } from '../constants/theme';

interface EditModalProps {
  visible: boolean;
  log: HealthLog | null;
  onSave: (logId: string, updates: Partial<HealthLog>) => void;
  onDismiss: () => void;
}

// Selector component for dropdown-like fields
interface SelectorProps {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function Selector({ label, value, options, onChange }: SelectorProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.selectorContainer}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.selectorOption,
              value === option.value && styles.selectorOptionSelected,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.selectorOptionText,
                value === option.value && styles.selectorOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// Slider-like component for level (1-10)
interface LevelSelectorProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
}

function LevelSelector({ label, value, onChange }: LevelSelectorProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}: {value || '-'}/10</Text>
      <View style={styles.levelContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
          <Pressable
            key={level}
            style={[
              styles.levelButton,
              value === level && styles.levelButtonSelected,
            ]}
            onPress={() => onChange(level)}
          >
            <Text
              style={[
                styles.levelButtonText,
                value === level && styles.levelButtonTextSelected,
              ]}
            >
              {level}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function EditModal({ visible, log, onSave, onDismiss }: EditModalProps) {
  // State for each category type
  const [nutritionContent, setNutritionContent] = useState<NutritionContent>({ items: [] });
  const [supplementContent, setSupplementContent] = useState<SupplementContent>({ name: '' });
  const [movementContent, setMovementContent] = useState<MovementContent>({ activity: '' });
  const [sleepContent, setSleepContent] = useState<SleepContent>({});
  const [wellbeingContent, setWellbeingContent] = useState<WellbeingContent>({ type: 'algemeen' });
  const [otherContent, setOtherContent] = useState<OtherContent>({ description: '' });

  // Initialize state when log changes
  useEffect(() => {
    if (log) {
      switch (log.category) {
        case 'voeding':
          setNutritionContent(log.content as NutritionContent);
          break;
        case 'supplement':
          setSupplementContent(log.content as SupplementContent);
          break;
        case 'beweging':
          setMovementContent(log.content as MovementContent);
          break;
        case 'slaap':
          setSleepContent(log.content as SleepContent);
          break;
        case 'welzijn':
          setWellbeingContent(log.content as WellbeingContent);
          break;
        case 'overig':
          setOtherContent(log.content as OtherContent);
          break;
      }
    }
  }, [log]);

  const handleSave = () => {
    if (!log) return;

    let content: HealthLogContent;
    switch (log.category) {
      case 'voeding':
        content = nutritionContent;
        break;
      case 'supplement':
        content = supplementContent;
        break;
      case 'beweging':
        content = movementContent;
        break;
      case 'slaap':
        content = sleepContent;
        break;
      case 'welzijn':
        content = wellbeingContent;
        break;
      case 'overig':
        content = otherContent;
        break;
      default:
        content = otherContent;
    }

    onSave(log.id, { content, was_edited: true });
  };

  if (!log) return null;

  const categoryInfo = CATEGORY_LABELS[log.category];
  const categoryColor = CATEGORY_COLORS[log.category];
  const categoryBgColor = CATEGORY_BG_COLORS[log.category];

  const renderCategoryFields = () => {
    switch (log.category) {
      case 'voeding':
        return (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Items</Text>
              <TextInput
                style={styles.textInput}
                value={nutritionContent.items?.join(', ') || ''}
                onChangeText={(text) =>
                  setNutritionContent({
                    ...nutritionContent,
                    items: text.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="bijv. appel, brood, kaas"
                placeholderTextColor={colors.ink[300]}
                multiline
              />
            </View>
            <Selector
              label="Maaltijd type"
              value={nutritionContent.meal_type}
              options={[
                { value: 'ontbijt', label: 'Ontbijt' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'diner', label: 'Diner' },
                { value: 'snack', label: 'Snack' },
                { value: 'drank', label: 'Drank' },
              ]}
              onChange={(value) =>
                setNutritionContent({
                  ...nutritionContent,
                  meal_type: value as NutritionContent['meal_type'],
                })
              }
            />
          </>
        );

      case 'supplement':
        return (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Naam</Text>
              <TextInput
                style={styles.textInput}
                value={supplementContent.name}
                onChangeText={(text) =>
                  setSupplementContent({ ...supplementContent, name: text })
                }
                placeholder="bijv. Vitamine D"
                placeholderTextColor={colors.ink[300]}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Dosering</Text>
              <TextInput
                style={styles.textInput}
                value={supplementContent.dosage || ''}
                onChangeText={(text) =>
                  setSupplementContent({ ...supplementContent, dosage: text })
                }
                placeholder="bijv. 1000"
                placeholderTextColor={colors.ink[300]}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Eenheid</Text>
              <TextInput
                style={styles.textInput}
                value={supplementContent.unit || ''}
                onChangeText={(text) =>
                  setSupplementContent({ ...supplementContent, unit: text })
                }
                placeholder="bijv. mg, IU"
                placeholderTextColor={colors.ink[300]}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Aantal</Text>
              <TextInput
                style={styles.textInput}
                value={supplementContent.quantity?.toString() || ''}
                onChangeText={(text) =>
                  setSupplementContent({
                    ...supplementContent,
                    quantity: text ? parseInt(text, 10) : undefined,
                  })
                }
                placeholder="bijv. 1"
                placeholderTextColor={colors.ink[300]}
                keyboardType="numeric"
              />
            </View>
          </>
        );

      case 'beweging':
        return (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Activiteit</Text>
              <TextInput
                style={styles.textInput}
                value={movementContent.activity}
                onChangeText={(text) =>
                  setMovementContent({ ...movementContent, activity: text })
                }
                placeholder="bijv. wandelen, fietsen"
                placeholderTextColor={colors.ink[300]}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Duur (minuten)</Text>
              <TextInput
                style={styles.textInput}
                value={movementContent.duration_minutes?.toString() || ''}
                onChangeText={(text) =>
                  setMovementContent({
                    ...movementContent,
                    duration_minutes: text ? parseInt(text, 10) : undefined,
                  })
                }
                placeholder="bijv. 30"
                placeholderTextColor={colors.ink[300]}
                keyboardType="numeric"
              />
            </View>
            <Selector
              label="Intensiteit"
              value={movementContent.intensity}
              options={[
                { value: 'licht', label: 'Licht' },
                { value: 'matig', label: 'Matig' },
                { value: 'intens', label: 'Intens' },
              ]}
              onChange={(value) =>
                setMovementContent({
                  ...movementContent,
                  intensity: value as MovementContent['intensity'],
                })
              }
            />
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Afstand (km)</Text>
              <TextInput
                style={styles.textInput}
                value={movementContent.distance_km?.toString() || ''}
                onChangeText={(text) =>
                  setMovementContent({
                    ...movementContent,
                    distance_km: text ? parseFloat(text) : undefined,
                  })
                }
                placeholder="bijv. 5"
                placeholderTextColor={colors.ink[300]}
                keyboardType="decimal-pad"
              />
            </View>
          </>
        );

      case 'slaap':
        return (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Duur (uren)</Text>
              <TextInput
                style={styles.textInput}
                value={sleepContent.duration_hours?.toString() || ''}
                onChangeText={(text) =>
                  setSleepContent({
                    ...sleepContent,
                    duration_hours: text ? parseFloat(text) : undefined,
                  })
                }
                placeholder="bijv. 7.5"
                placeholderTextColor={colors.ink[300]}
                keyboardType="decimal-pad"
              />
            </View>
            <Selector
              label="Kwaliteit"
              value={sleepContent.quality}
              options={[
                { value: 'slecht', label: 'Slecht' },
                { value: 'matig', label: 'Matig' },
                { value: 'goed', label: 'Goed' },
                { value: 'uitstekend', label: 'Uitstekend' },
              ]}
              onChange={(value) =>
                setSleepContent({
                  ...sleepContent,
                  quality: value as SleepContent['quality'],
                })
              }
            />
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Notities</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={sleepContent.notes || ''}
                onChangeText={(text) =>
                  setSleepContent({ ...sleepContent, notes: text })
                }
                placeholder="Optionele notities..."
                placeholderTextColor={colors.ink[300]}
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        );

      case 'welzijn':
        return (
          <>
            <Selector
              label="Type"
              value={wellbeingContent.type}
              options={[
                { value: 'energie', label: 'Energie' },
                { value: 'mood', label: 'Stemming' },
                { value: 'stress', label: 'Stress' },
                { value: 'symptoom', label: 'Symptoom' },
                { value: 'algemeen', label: 'Algemeen' },
              ]}
              onChange={(value) =>
                setWellbeingContent({
                  ...wellbeingContent,
                  type: value as WellbeingContent['type'],
                })
              }
            />
            <LevelSelector
              label="Niveau"
              value={wellbeingContent.level}
              onChange={(value) =>
                setWellbeingContent({ ...wellbeingContent, level: value })
              }
            />
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Beschrijving</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={wellbeingContent.description || ''}
                onChangeText={(text) =>
                  setWellbeingContent({ ...wellbeingContent, description: text })
                }
                placeholder="Beschrijf je welzijn..."
                placeholderTextColor={colors.ink[300]}
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        );

      case 'overig':
      default:
        return (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Beschrijving</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              value={otherContent.description}
              onChangeText={(text) =>
                setOtherContent({ ...otherContent, description: text })
              }
              placeholder="Beschrijf je log..."
              placeholderTextColor={colors.ink[300]}
              multiline
              numberOfLines={4}
            />
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onDismiss} />

        <View style={styles.content}>
          {/* Drag indicator */}
          <View style={styles.dragIndicator} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Edit2 size={22} color={colors.amber[600]} strokeWidth={1.5} />
            </View>
            <Text style={styles.headerTitle}>Log bewerken</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={onDismiss}
              hitSlop={8}
            >
              <X size={20} color={colors.ink[400]} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* Category badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryBgColor }]}>
            <Text style={styles.emoji}>{categoryInfo.emoji}</Text>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {categoryInfo.dutch}
            </Text>
          </View>

          {/* Scrollable form fields */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderCategoryFields()}
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}
              onPress={onDismiss}
            >
              <Text style={styles.cancelButtonText}>Annuleren</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
              ]}
              onPress={handleSave}
            >
              <Check size={18} color={colors.paper[100]} strokeWidth={2} />
              <Text style={styles.saveButtonText}>Opslaan</Text>
            </Pressable>
          </View>
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
    maxHeight: '85%',
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
    marginBottom: 16,
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  emoji: {
    fontSize: 16,
  },
  categoryText: {
    ...typography.caption,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  formScroll: {
    flexGrow: 0,
    maxHeight: 350,
  },
  formContent: {
    paddingBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    ...typography.body,
    fontSize: 13,
    color: colors.ink[500],
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: colors.paper[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.body,
    fontSize: 15,
    color: colors.ink[700],
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.paper[200],
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
  selectorOptionSelected: {
    backgroundColor: colors.amber[50],
    borderColor: colors.amber[200],
  },
  selectorOptionText: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink[500],
  },
  selectorOptionTextSelected: {
    color: colors.amber[800],
    fontWeight: '500',
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.paper[200],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
  levelButtonSelected: {
    backgroundColor: colors.amber[500],
    borderColor: colors.amber[600],
  },
  levelButtonText: {
    ...typography.body,
    fontSize: 12,
    color: colors.ink[500],
    fontWeight: '500',
  },
  levelButtonTextSelected: {
    color: colors.paper[100],
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.paper[200],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
  cancelButtonPressed: {
    backgroundColor: colors.paper[300],
  },
  cancelButtonText: {
    ...typography.body,
    fontSize: 15,
    color: colors.ink[500],
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.amber[600],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonPressed: {
    backgroundColor: colors.amber[700],
  },
  saveButtonText: {
    ...typography.body,
    fontSize: 15,
    color: colors.paper[100],
    fontWeight: '600',
  },
});
