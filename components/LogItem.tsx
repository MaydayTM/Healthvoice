import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Edit2, Trash2, Check, AlertCircle } from 'lucide-react-native';
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
} from '../types';
import { colors, shadows, typography } from '../constants/theme';

interface LogItemProps {
  log: HealthLog;
  onEdit?: (log: HealthLog) => void;
  onDelete?: (log: HealthLog) => void;
  showActions?: boolean;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatContent(category: Category, content: HealthLog['content']): string {
  switch (category) {
    case 'voeding': {
      const c = content as NutritionContent;
      const items = c.items?.join(', ') || '';
      const mealType = c.meal_type ? ` (${c.meal_type})` : '';
      return `${items}${mealType}`;
    }
    case 'supplement': {
      const c = content as SupplementContent;
      const dosage = c.dosage ? ` - ${c.dosage}${c.unit || ''}` : '';
      const qty = c.quantity ? ` x${c.quantity}` : '';
      return `${c.name}${dosage}${qty}`;
    }
    case 'beweging': {
      const c = content as MovementContent;
      const duration = c.duration_minutes ? ` - ${c.duration_minutes} min` : '';
      const intensity = c.intensity ? ` (${c.intensity})` : '';
      const distance = c.distance_km ? `, ${c.distance_km} km` : '';
      return `${c.activity}${duration}${intensity}${distance}`;
    }
    case 'slaap': {
      const c = content as SleepContent;
      const duration = c.duration_hours ? `${c.duration_hours} uur` : '';
      const quality = c.quality ? ` - ${c.quality}` : '';
      const notes = c.notes ? ` (${c.notes})` : '';
      return `${duration}${quality}${notes}` || 'Slaap gelogd';
    }
    case 'welzijn': {
      const c = content as WellbeingContent;
      const level = c.level ? ` (${c.level}/10)` : '';
      return `${c.description || c.type}${level}`;
    }
    case 'overig':
    default: {
      const c = content as OtherContent;
      return c.description || 'Overige log';
    }
  }
}

export function LogItem({
  log,
  onEdit,
  onDelete,
  showActions = true,
}: LogItemProps) {
  const categoryInfo = CATEGORY_LABELS[log.category];
  const categoryColor = CATEGORY_COLORS[log.category];
  const categoryBgColor = CATEGORY_BG_COLORS[log.category];
  const contentText = formatContent(log.category, log.content);
  const isLowConfidence = log.confidence_score < 0.7;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? colors.paper[200] : colors.paper[100] }
      ]}
    >
      {/* Subtle category accent line */}
      <View
        style={[styles.categoryAccent, { backgroundColor: categoryColor }]}
      />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryBgColor }]}>
            <Text style={styles.emoji}>{categoryInfo.emoji}</Text>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {categoryInfo.dutch}
            </Text>
          </View>

          <Text style={styles.time}>{formatTime(log.logged_at)}</Text>
        </View>

        {/* Main content */}
        <Text style={styles.contentText} numberOfLines={2}>
          {contentText}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Status indicators */}
          <View style={styles.statusContainer}>
            {log.was_edited && (
              <View style={styles.statusBadge}>
                <Edit2 size={10} color={colors.ink[400]} strokeWidth={1.5} />
                <Text style={styles.statusText}>Bewerkt</Text>
              </View>
            )}

            {isLowConfidence && (
              <View style={[styles.statusBadge, styles.warningBadge]}>
                <AlertCircle size={10} color={colors.warning} strokeWidth={1.5} />
                <Text style={[styles.statusText, { color: colors.warning }]}>
                  {Math.round(log.confidence_score * 100)}%
                </Text>
              </View>
            )}

            {log.apple_health_synced && (
              <View style={[styles.statusBadge, styles.syncedBadge]}>
                <Check size={10} color={colors.success} strokeWidth={1.5} />
                <Text style={[styles.statusText, { color: colors.success }]}>
                  Gesynct
                </Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          {showActions && (
            <View style={styles.actions}>
              {onEdit && (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => onEdit(log)}
                  hitSlop={8}
                >
                  <Edit2 size={16} color={colors.ink[400]} strokeWidth={1.5} />
                </Pressable>
              )}

              {onDelete && (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => onDelete(log)}
                  hitSlop={8}
                >
                  <Trash2 size={16} color={colors.terra.DEFAULT} strokeWidth={1.5} />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.paper[100],
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.ink[100],
    overflow: 'hidden',
    ...shadows.soft,
  },
  categoryAccent: {
    width: 3,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emoji: {
    fontSize: 14,
  },
  categoryText: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  time: {
    ...typography.caption,
    fontSize: 11,
    color: colors.ink[400],
  },
  contentText: {
    ...typography.body,
    fontSize: 15,
    color: colors.ink[700],
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.ink[50],
    borderRadius: 4,
  },
  warningBadge: {
    backgroundColor: colors.amber[50],
  },
  syncedBadge: {
    backgroundColor: 'rgba(77, 124, 15, 0.08)',
  },
  statusText: {
    ...typography.micro,
    fontSize: 9,
    color: colors.ink[400],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.paper[200],
  },
  actionButtonPressed: {
    backgroundColor: colors.paper[300],
  },
});
