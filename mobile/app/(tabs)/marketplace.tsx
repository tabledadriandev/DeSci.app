import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getMarketplaceItems } from '../../lib/api';

interface Item {
  id: string;
  name: string;
  type: string;
  price: number;
  currency: string;
}

export default function MarketplaceScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMarketplaceItems();
        setItems(data.items ?? []);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load marketplace items');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>MARKET</Text>
        <Text style={styles.title}>Wellness Marketplace</Text>
        <Text style={styles.subtitle}>Products and services paid with $tabledadrian.</Text>
      </View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator color="#0F4C81" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.loading}>
          <Text style={{ color: '#DC2626' }}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.type}</Text>
              <Text style={styles.itemPrice}>
                {item.price.toFixed(2)} {item.currency}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.loading}>
              <Text style={{ color: '#6B6560' }}>No items yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 8,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6560',
  },
  loading: {
    padding: 24,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemMeta: {
    fontSize: 12,
    color: '#8B8580',
    marginTop: 2,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4C81',
  },
});


