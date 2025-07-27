import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // This useEffect hook handles the "getItem" part
  useEffect(() => {
    async function loadStorage() {
      try {
        // Tries to get the item from AsyncStorage
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.log("Failed to load data:", error);
      }
    }
    loadStorage();
  }, [key]);

  // This useEffect hook handles the "setItem" part
  useEffect(() => {
    async function saveStorage() {
      try {
        const valueToStore =
          storedValue instanceof Function ? storedValue(storedValue) : storedValue;
        // Saves the item to AsyncStorage
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log("Failed to save data:", error);
      }
    }
    saveStorage();
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;