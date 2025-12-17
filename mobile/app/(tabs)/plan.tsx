import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getUserId } from '../../lib/user-id';

type PlanDay = {
  day: string;
  tasks: { description: string; completed: boolean }[];
};

export default function PlanScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<PlanDay[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const id = await getUserId();
        if (!id) {
          setError('Set your ID in the Profile tab to view your wellness plan.');
          return;
        }
        const url = new URL(
          (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000') +
            '/api/health/wellness-plan',
        );
        url.searchParams.set('userId', id);
        const res = await fetch(url.toString());
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || 'No active wellness plan found.');
          return;
        }
        const plan = await res.json();
        setDays(plan.weeklyTasks || []);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load wellness plan.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>PLAN</Text>
      <Text style={styles.title}>Weekly Wellness Plan</Text>
      <Text style={styles.subtitle}>
        A mobile view of your current weekly tasks from the web wellness planner.
      </Text>

      {loading && (
        <View style={styles.card}>
          <ActivityIndicator color="#0F4C81" />
          <Text style={styles.cardText}>Loading wellness plan…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.card}>
          <Text style={[styles.cardText, { color: '#DC2626' }]}>{error}</Text>
        </View>
      )}

      {!loading && !error && days.length > 0 && (
        <View style={styles.daysGrid}>
          {days.map((day, idx) => (
            <View key={idx} style={styles.dayCard}>
              <Text style={styles.dayTitle}>{day.day}</Text>
              {day.tasks.map((task, tIdx) => (
                <View key={tIdx} style={styles.taskRow}>
                  <View
                    style={[
                      styles.bullet,
                      task.completed ? styles.bulletDone : styles.bulletTodo,
                    ]}
                  />
                  <Text
                    style={[
                      styles.taskText,
                      task.completed && { textDecorationLine: 'line-through', opacity: 0.6 },
                    ]}
                  >
                    {task.description}
                  </Text>
                </View>
              ))}
            </View>
          ))}
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
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginHorizontal: -6,
  },
  dayCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginTop: 12,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4C81',
    marginBottom: 6,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 5,
    marginRight: 6,
  },
  bulletDone: {
    backgroundColor: '#10B981',
  },
  bulletTodo: {
    backgroundColor: '#E5E7EB',
  },
  taskText: {
    fontSize: 12,
    color: '#374151',
    flexShrink: 1,
  },
});


