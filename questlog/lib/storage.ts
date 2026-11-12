import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_KEY = 'questlog-demo-v1';
const SERVER_KEY = 'questlog-server-url';

export async function getJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setJSON(key: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const demoStorage = {
  load: <T>() => getJSON<T>(DEMO_KEY),
  save: (value: unknown) => setJSON(DEMO_KEY, value),
};

export const serverUrlStorage = {
  load: () => AsyncStorage.getItem(SERVER_KEY),
  save: (value: string) => AsyncStorage.setItem(SERVER_KEY, value),
  clear: () => AsyncStorage.removeItem(SERVER_KEY),
};
