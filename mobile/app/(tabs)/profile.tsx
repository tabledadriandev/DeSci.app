import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getUserId, setUserId } from '../../lib/user-id';

export default function ProfileScreen() {
  const [value, setValue] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const existing = await getUserId();
      if (existing) setValue(existing);
      setLoaded(true);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!value.trim()) {
      Alert.alert('Missing ID', 'Please enter your wallet address or email.');
      return;
    }
    await setUserId(value.trim());
    Alert.alert('Saved', 'Your ID is now linked to your mobile app.');
  };

  if (!loaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.kicker}>PROFILE</Text>
        <Text style={styles.title}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>PROFILE</Text>
      <Text style={styles.title}>Link Your Account</Text>
      <Text style={styles.subtitle}>
        Enter the same wallet address or email you use on the web app. Mobile data will then map to
        the same Table d&apos;Adrian account.
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="0x... wallet or email@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2933',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0F4C81',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});


