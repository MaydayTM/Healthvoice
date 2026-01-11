import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Trophy, TrendingUp, PieChart } from 'lucide-react-native';
import { useAppStore } from '../../stores/appStore';
import { useLogs } from '../../hooks/useLogs';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_BG_COLORS,
  Category,
} from '../../types';
import { colors, typography, shadows } from '../../constants/theme';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

function StatCard({ icon, title, value, subtitle, color = colors.amber[700] }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}10` }]}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

interface CategoryBarProps {
  category: Category;
  count: number;
  maxCount: number;
}

function CategoryBar({ category, count, maxCount }: CategoryBarProps) {
  const info = CATEGORY_LABELS[category];
  const color = CATEGORY_COLORS[category];
  const bgColor = CATEGORY_BG_COLORS[category];
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <View style={styles.categoryBar}>
      <View style={[styles.categoryInfo, { backgroundColor: bgColor }]}>
        <Text style={styles.categoryEmoji}>{info.emoji}</Text>
        <Text style={[styles.categoryName, { color }]}>{info.dutch}</Text>
      </View>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.categoryCount, { color }]}>{count}</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const { stats } = useAppStore();
  const { logs, getCategoryDistribution } = useLogs();

  const categoryDistribution = useMemo(() => {
    return getCategoryDistribution();
  }, [getCategoryDistribution]);

  const maxCategoryCount = useMemo(() => {
    return Math.max(...Object.values(categoryDistribution), 1);
  }, [categoryDistribution]);

  // Calculate this week's logs
  const thisWeekLogs = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return logs.filter((log) => new Date(log.logged_at) >= weekAgo).length;
  }, [logs]);

  // Calculate average logs per day (last 30 days)
  const avgLogsPerDay = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentLogs = logs.filter((log) => new Date(log.logged_at) >= monthAgo);

    const uniqueDays = new Set(
      recentLogs.map((log) => log.logged_at.split('T')[0])
    ).size;

    if (uniqueDays === 0) return 0;
    return (recentLogs.length / uniqueDays).toFixed(1);
  }, [logs]);

  const sortedCategories = useMemo(() => {
    return (Object.keys(CATEGORY_LABELS) as Category[]).sort(
      (a, b) => (categoryDistribution[b] || 0) - (categoryDistribution[a] || 0)
    );
  }, [categoryDistribution]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandLabel}>HEALTHVOICE</Text>
          <Text style={styles.title}>Inzichten</Text>
          <Text style={styles.subtitle}>
            Je gezondheidsoverzicht
          </Text>
        </View>

        {/* Stats cards */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Flame size={22} color={colors.amber[600]} strokeWidth={1.5} />}
            title="Huidige streak"
            value={stats?.current_streak || 0}
            subtitle="dagen"
            color={colors.amber[600]}
          />

          <StatCard
            icon={<Trophy size={22} color={colors.category.supplement} strokeWidth={1.5} />}
            title="Langste streak"
            value={stats?.longest_streak || 0}
            subtitle="dagen"
            color={colors.category.supplement}
          />

          <StatCard
            icon={<TrendingUp size={22} color={colors.success} strokeWidth={1.5} />}
            title="Deze week"
            value={thisWeekLogs}
            subtitle="logs"
            color={colors.success}
          />

          <StatCard
            icon={<PieChart size={22} color={colors.category.slaap} strokeWidth={1.5} />}
            title="Gemiddeld"
            value={avgLogsPerDay}
            subtitle="per dag"
            color={colors.category.slaap}
          />
        </View>

        {/* Total logs */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAAL AANTAL LOGS</Text>
          <Text style={styles.totalValue}>{stats?.total_logs || logs.length}</Text>
        </View>

        {/* Category breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verdeling per categorie</Text>

          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Start met loggen om je categorieverdeling te zien
              </Text>
            </View>
          ) : (
            <View style={styles.categoryList}>
              {sortedCategories.map((category) => (
                <CategoryBar
                  key={category}
                  category={category}
                  count={categoryDistribution[category] || 0}
                  maxCount={maxCategoryCount}
                />
              ))}
            </View>
          )}
        </View>

        {/* Tips section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              Probeer elke dag minstens een log toe te voegen om je streak te behouden.
              Consistentie is de sleutel tot inzicht in je gezondheid.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper.DEFAULT,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
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
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.ink[400],
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.paper[100],
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ink[100],
    ...shadows.soft,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    ...typography.caption,
    fontSize: 10,
    color: colors.ink[400],
    marginBottom: 2,
  },
  statValue: {
    ...typography.headline,
    fontSize: 26,
    fontWeight: '300',
  },
  statSubtitle: {
    ...typography.micro,
    fontSize: 9,
    color: colors.ink[400],
    marginTop: 1,
  },
  totalCard: {
    backgroundColor: colors.ink[800],
    borderRadius: 14,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 20,
    alignItems: 'center',
    ...shadows.elevated,
  },
  totalLabel: {
    ...typography.micro,
    fontSize: 10,
    color: colors.paper[300],
    marginBottom: 4,
  },
  totalValue: {
    ...typography.display,
    fontSize: 56,
    color: colors.paper[100],
    fontWeight: '200',
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.ink[400],
    marginBottom: 12,
    paddingLeft: 4,
  },
  categoryList: {
    backgroundColor: colors.paper[100],
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
  categoryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryName: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.paper[200],
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryCount: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '500',
    width: 28,
    textAlign: 'right',
  },
  emptyState: {
    backgroundColor: colors.paper[100],
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ink[100],
  },
  emptyStateText: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink[400],
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: colors.amber[50],
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.amber[100],
  },
  tipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.amber[800],
    lineHeight: 22,
  },
});
