import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Heart,
  FileDown,
  Trash2,
  ChevronRight,
  LogOut,
  Info,
  Bell,
  Smartphone,
} from 'lucide-react-native';
import { useAppStore } from '../../stores/appStore';
import { updateProfile, signOut } from '../../lib/supabase';
import { colors, typography, shadows } from '../../constants/theme';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  danger,
}: SettingRowProps) {
  const content = (
    <View style={styles.settingRow}>
      <View
        style={[
          styles.settingIcon,
          danger && styles.settingIconDanger,
        ]}
      >
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <ChevronRight size={18} color={colors.ink[300]} strokeWidth={1.5} />)}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.settingPressable,
          pressed && styles.settingPressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function SettingsScreen() {
  const { user, setUser, reset } = useAppStore();

  const [appleHealthSync, setAppleHealthSync] = useState(
    user?.preferences?.apple_health_sync || false
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    user?.preferences?.weekly_digest || false
  );

  const handleAppleHealthToggle = async (value: boolean) => {
    setAppleHealthSync(value);

    if (user) {
      const updated = await updateProfile(user.id, {
        preferences: {
          ...user.preferences,
          apple_health_sync: value,
        },
      });

      if (updated) {
        setUser(updated);
      }
    }
  };

  const handleWeeklyDigestToggle = async (value: boolean) => {
    setWeeklyDigest(value);

    if (user) {
      const updated = await updateProfile(user.id, {
        preferences: {
          ...user.preferences,
          weekly_digest: value,
        },
      });

      if (updated) {
        setUser(updated);
      }
    }
  };

  const handleExport = () => {
    Alert.alert(
      'Exporteren',
      'Je data wordt als CSV geëxporteerd naar je apparaat.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Exporteren',
          onPress: () => {
            // TODO: Implement CSV export
            Alert.alert('Binnenkort beschikbaar', 'Deze functie komt binnenkort.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Account verwijderen',
      'Weet je zeker dat je je account en alle data wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement account deletion
            Alert.alert('Binnenkort beschikbaar', 'Deze functie komt binnenkort.');
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Uitloggen',
          onPress: async () => {
            await signOut();
            reset();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandLabel}>HEALTHVOICE</Text>
          <Text style={styles.title}>Instellingen</Text>
        </View>

        {/* Profile section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profiel</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              icon={<User size={18} color={colors.ink[500]} strokeWidth={1.5} />}
              title={user?.display_name || 'Anonieme gebruiker'}
              subtitle="Tik om naam te wijzigen"
              onPress={() => {
                Alert.prompt(
                  'Naam wijzigen',
                  'Voer je nieuwe naam in',
                  async (name) => {
                    if (name && user) {
                      const updated = await updateProfile(user.id, {
                        display_name: name,
                      });
                      if (updated) {
                        setUser(updated);
                      }
                    }
                  },
                  'plain-text',
                  user?.display_name || ''
                );
              }}
            />
          </View>
        </View>

        {/* Integrations section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integraties</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              icon={<Heart size={18} color={colors.terra.DEFAULT} strokeWidth={1.5} />}
              title="Apple Health"
              subtitle="Synchroniseer logs met Apple Health"
              rightElement={
                <Switch
                  value={appleHealthSync}
                  onValueChange={handleAppleHealthToggle}
                  trackColor={{ false: colors.ink[200], true: colors.amber[400] }}
                  thumbColor={colors.paper[100]}
                  ios_backgroundColor={colors.ink[200]}
                />
              }
            />
          </View>
        </View>

        {/* Notifications section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meldingen</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              icon={<Bell size={18} color={colors.ink[500]} strokeWidth={1.5} />}
              title="Wekelijks overzicht"
              subtitle="Ontvang een e-mail met je weekstatistieken"
              rightElement={
                <Switch
                  value={weeklyDigest}
                  onValueChange={handleWeeklyDigestToggle}
                  trackColor={{ false: colors.ink[200], true: colors.amber[400] }}
                  thumbColor={colors.paper[100]}
                  ios_backgroundColor={colors.ink[200]}
                />
              }
            />
          </View>
        </View>

        {/* Data section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              icon={<FileDown size={18} color={colors.ink[500]} strokeWidth={1.5} />}
              title="Exporteer data"
              subtitle="Download al je logs als CSV"
              onPress={handleExport}
            />
            <View style={styles.settingDivider} />
            <SettingRow
              icon={<Trash2 size={18} color={colors.error} strokeWidth={1.5} />}
              title="Verwijder account"
              subtitle="Verwijder je account en alle data"
              onPress={handleDeleteAccount}
              danger
            />
          </View>
        </View>

        {/* About section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Over</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              icon={<Smartphone size={18} color={colors.ink[500]} strokeWidth={1.5} />}
              title="App versie"
              subtitle="1.0.0 (POC)"
            />
            <View style={styles.settingDivider} />
            <SettingRow
              icon={<Info size={18} color={colors.ink[500]} strokeWidth={1.5} />}
              title="Over HealthVoice"
              onPress={() => {
                Alert.alert(
                  'HealthVoice',
                  'Speak once, log everything.\n\nHealthVoice is een frictionless voice-based health logging app. Spreek in wat je wilt loggen en wij doen de rest.\n\n© 2024 HealthVoice'
                );
              }}
            />
          </View>
        </View>

        {/* Sign out button */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <SettingRow
              icon={<LogOut size={18} color={colors.error} strokeWidth={1.5} />}
              title="Uitloggen"
              onPress={handleSignOut}
              danger
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            HealthVoice houdt geen medische gegevens bij en geeft geen medisch advies.
          </Text>
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 10,
    color: colors.ink[400],
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: colors.paper[100],
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.ink[100],
    overflow: 'hidden',
  },
  settingPressable: {},
  settingPressed: {
    backgroundColor: colors.paper[200],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.paper[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconDanger: {
    backgroundColor: 'rgba(185, 28, 28, 0.08)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink[700],
  },
  settingTitleDanger: {
    color: colors.error,
  },
  settingSubtitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.ink[400],
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.ink[100],
    marginLeft: 62,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    fontSize: 12,
    color: colors.ink[400],
    textAlign: 'center',
    lineHeight: 18,
  },
});
