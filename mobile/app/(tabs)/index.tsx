import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getHealthScore, saveDailyHabits } from '../../lib/api';
import { getUserId } from '../../lib/user-id';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const id = await getUserId();
        if (!id) {
          setError('Set your ID in the Profile tab to personalize your dashboard.');
          return;
        }
        const scoreData = await getHealthScore(id);
        const value = scoreData?.current?.score ?? scoreData?.score ?? null;
        setHealthScore(typeof value === 'number' ? value : null);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleQuickLog = async () => {
    try {
      const id = await getUserId();
      if (!id) {
        Alert.alert('Profile needed', 'Set your ID in the Profile tab first.');
        return;
      }
      if (!steps && !sleepHours) {
        Alert.alert('Nothing to save', 'Enter steps, sleep, or both before saving.');
        return;
      }
      setSaving(true);
      const payload: Record<string, any> = {};
      if (steps) payload.steps = Number(steps);
      if (sleepHours) payload.sleepHours = Number(sleepHours);
      await saveDailyHabits(id, payload);
      Alert.alert('Saved', 'Your daily habits have been logged.');
      setSteps('');
      setSleepHours('');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save habits');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>TABLE D'ADRIAN</Text>
      <Text style={styles.title}>Wellness Dashboard</Text>
      <Text style={styles.subtitle}>
        Quickly glance your health score, streak, and latest $tabledadrian rewards.
      </Text>

      {loading && (
        <View style={styles.card}>
          <ActivityIndicator color="#0F4C81" />
          <Text style={styles.cardText}>Loading...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.card}>
          <Text style={[styles.cardText, { color: '#DC2626' }]}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <>
          <View style={styles.row}>
            <View style={styles.cardSmall}>
              <Text style={styles.cardLabel}>Health Score</Text>
              <Text style={styles.cardValue}>{healthScore ?? 0}</Text>
            </View>
            <View style={styles.cardSmall}>
              <Text style={styles.cardLabel}>Streak</Text>
              <Text style={styles.cardValue}>0</Text>
            </View>
            <View style={styles.cardSmall}>
              <Text style={styles.cardLabel}>$tabledadrian Earned</Text>
              <Text style={styles.cardValue}>0.00</Text>
            </View>
          </View>

          <View style={[styles.card, { alignItems: 'flex-start', marginTop: 16 }]}>
            <Text style={[styles.cardLabel, { marginBottom: 8 }]}>
              Quick Daily Log
            </Text>
            <TextInput
              value={steps}
              onChangeText={setSteps}
              placeholder="Steps today"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              value={sleepHours}
              onChangeText={setSleepHours}
              placeholder="Sleep hours last night"
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity
              onPress={handleQuickLog}
              disabled={saving}
              style={styles.logButton}
            >
              <Text style={styles.logButtonText}>
                {saving ? 'Saving…' : 'Save Daily Habits'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 4,
    color: '#8B8580',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F4C81',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6560',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B6560',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardSmall: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginRight: 8,
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#8B8580',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F4C81',
  },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    marginTop: 8,
  },
  logButton: {
    marginTop: 12,
    backgroundColor: '#0F4C81',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});


