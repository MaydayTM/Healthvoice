import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useLogs } from '../../hooks/useLogs';
import { LogItem } from '../../components/LogItem';
import { CATEGORY_COLORS, Category } from '../../types';
import { colors, typography, shadows } from '../../constants/theme';

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Adjust for Monday-based week (0 = Monday, 6 = Sunday)
  let startPadding = firstDay.getDay() - 1;
  if (startPadding < 0) startPadding = 6;

  const daysInMonth = lastDay.getDate();

  const days: Array<{ date: Date | null; day: number | null }> = [];

  // Add padding for start of month
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: null, day: null });
  }

  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), day: i });
  }

  return days;
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { logs, getLogsForDate } = useLogs();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  // Create a map of dates to log counts
  const logCountsByDate = useMemo(() => {
    const counts: Record<string, { total: number; categories: Record<Category, number> }> = {};

    logs.forEach((log) => {
      const date = log.logged_at.split('T')[0];
      if (!counts[date]) {
        counts[date] = { total: 0, categories: {} as Record<Category, number> };
      }
      counts[date].total += 1;
      counts[date].categories[log.category] = (counts[date].categories[log.category] || 0) + 1;
    });

    return counts;
  }, [logs]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const selectDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(selectedDate === dateString ? null : dateString);
  };

  const selectedLogs = selectedDate ? getLogsForDate(selectedDate) : [];

  const getHeatmapColor = (count: number) => {
    if (count === 0) return colors.paper[200];
    if (count === 1) return colors.amber[100];
    if (count <= 3) return colors.amber[200];
    if (count <= 5) return colors.amber[400];
    return colors.amber[600];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandLabel}>HEALTHVOICE</Text>
        <Text style={styles.title}>Kalender</Text>
      </View>

      {/* Month navigation */}
      <View style={styles.monthNav}>
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.navButtonPressed,
          ]}
          onPress={() => navigateMonth('prev')}
        >
          <ChevronLeft size={20} color={colors.ink[600]} strokeWidth={1.5} />
        </Pressable>

        <Text style={styles.monthTitle}>
          {MONTHS[month]} {year}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.navButtonPressed,
          ]}
          onPress={() => navigateMonth('next')}
        >
          <ChevronRight size={20} color={colors.ink[600]} strokeWidth={1.5} />
        </Pressable>
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarContainer}>
        {/* Day headers */}
        <View style={styles.daysHeader}>
          {DAYS.map((day) => (
            <View key={day} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar days */}
        <View style={styles.daysGrid}>
          {monthDays.map((item, index) => {
            if (!item.date || !item.day) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const dateString = item.date.toISOString().split('T')[0];
            const logData = logCountsByDate[dateString];
            const count = logData?.total || 0;
            const isSelected = selectedDate === dateString;
            const isTodayDate = isToday(item.date);

            return (
              <Pressable
                key={dateString}
                style={[
                  styles.dayCell,
                  { backgroundColor: getHeatmapColor(count) },
                  isSelected && styles.selectedDay,
                  isTodayDate && styles.todayDay,
                ]}
                onPress={() => selectDate(item.date!)}
              >
                <Text
                  style={[
                    styles.dayText,
                    count > 3 && styles.dayTextLight,
                    isSelected && styles.selectedDayText,
                    isTodayDate && styles.todayDayText,
                  ]}
                >
                  {item.day}
                </Text>
                {count > 0 && (
                  <View style={[
                    styles.countDot,
                    count > 3 && styles.countDotLight,
                  ]} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Minder</Text>
        <View style={styles.legendColors}>
          {[0, 1, 2, 4, 6].map((count) => (
            <View
              key={count}
              style={[
                styles.legendColor,
                { backgroundColor: getHeatmapColor(count) },
              ]}
            />
          ))}
        </View>
        <Text style={styles.legendLabel}>Meer</Text>
      </View>

      {/* Selected date logs */}
      {selectedDate && (
        <View style={styles.selectedLogsContainer}>
          <View style={styles.selectedLogsHeader}>
            <View style={styles.dragIndicator} />
            <Text style={styles.selectedDateTitle}>
              {new Date(selectedDate).toLocaleDateString('nl-NL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>

          {selectedLogs.length === 0 ? (
            <View style={styles.noLogsContainer}>
              <Text style={styles.noLogsText}>Geen logs op deze dag</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.logsScroll}
              showsVerticalScrollIndicator={false}
            >
              {selectedLogs.map((log) => (
                <LogItem key={log.id} log={log} showActions={false} />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper.DEFAULT,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink[100],
  },
  brandLabel: {
    ...typography.micro,
    color: colors.ink[400],
    marginBottom: 4,
  },
  title: {
    ...typography.headline,
    fontSize: 36,
    color: colors.ink[800],
    fontWeight: '300',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.paper[200],
  },
  navButtonPressed: {
    backgroundColor: colors.paper[300],
  },
  monthTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.ink[700],
    fontWeight: '500',
  },
  calendarContainer: {
    paddingHorizontal: 16,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink[100],
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayHeaderText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.ink[400],
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 4,
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: colors.ink[800],
  },
  todayDay: {
    borderWidth: 2,
    borderColor: colors.terra.DEFAULT,
  },
  dayText: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink[600],
    fontWeight: '400',
  },
  dayTextLight: {
    color: colors.paper[100],
    fontWeight: '500',
  },
  selectedDayText: {
    fontWeight: '600',
    color: colors.ink[800],
  },
  todayDayText: {
    fontWeight: '600',
    color: colors.terra.DEFAULT,
  },
  countDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.amber[700],
    marginTop: 2,
  },
  countDotLight: {
    backgroundColor: colors.paper[100],
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink[100],
  },
  legendLabel: {
    ...typography.micro,
    fontSize: 9,
    color: colors.ink[400],
  },
  legendColors: {
    flexDirection: 'row',
    gap: 4,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  selectedLogsContainer: {
    flex: 1,
    backgroundColor: colors.paper[100],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: colors.ink[100],
  },
  selectedLogsHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ink[200],
    marginBottom: 12,
  },
  selectedDateTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.ink[700],
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  noLogsContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noLogsText: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink[400],
  },
  logsScroll: {
    flex: 1,
  },
});
