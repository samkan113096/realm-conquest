import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_KEY = 'shadow_strike_tutorial_dismissed';
const STORY_KEY = 'shadow_strike_story_dismissed';

async function read(key) {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function write(key, value) {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch {
    /* ignore storage errors */
  }
}

export function isTutorialDismissed() {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  }
  return false;
}

export async function isTutorialDismissedAsync() {
  return (await read(TUTORIAL_KEY)) === '1';
}

export function dismissTutorialForever() {
  write(TUTORIAL_KEY, '1');
}

export async function dismissTutorialForeverAsync() {
  await write(TUTORIAL_KEY, '1');
}

export async function isStorySkippedAsync() {
  return (await read(STORY_KEY)) === '1';
}

export async function dismissStoryForeverAsync() {
  await write(STORY_KEY, '1');
}

export async function resetTutorialDismissed() {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(TUTORIAL_KEY);
      return;
    }
    await AsyncStorage.removeItem(TUTORIAL_KEY);
  } catch {
    /* ignore */
  }
}
