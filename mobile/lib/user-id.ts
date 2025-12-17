import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ta_user_id';

export async function getUserId(): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value || null;
  } catch {
    return null;
  }
}

export async function setUserId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, id);
  } catch {
    // ignore
  }
}


