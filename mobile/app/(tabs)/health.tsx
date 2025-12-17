import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getHealthScore } from '../../lib/api';
import { getUserId } from '../../lib/user-id';

export default function HealthScreen() {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const id = await getUserId();
        if (!id) {
          setError('Set your ID in the Profile tab to see your health score.');
          return;
        }
        const data = await getHealthScore(id);
        const value = data?.current?.score ?? data?.score ?? null;
        setScore(typeof value === 'number' ? value : null);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load health score');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>HEALTH</Text>
      <Text style={styles.title}>Your Health Score</Text>
      <Text style={styles.subtitle}>
        This pulls data from the Next.js backend (`/api/health/score`) via EXPO_PUBLIC_API_URL.
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
        <View style={styles.card}>
          <Text style={styles.score}>{score ?? 0}</Text>
          <Text style={styles.cardText}>Overall health score</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 4,
    color: '#8B8580',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F4C81',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6560',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  score: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0F4C81',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#6B6560',
    textAlign: 'center',
  },
});


