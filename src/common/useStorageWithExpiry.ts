// src/common/useStorageWithExpiry.ts

type StorageType = 'localStorage' | 'sessionStorage';

interface StorageItem<T> {
  value: T;
  expiry: number;
}

interface UseStorageWithExpiryOptions {
  storage?: StorageType;
}

export function useStorageWithExpiry(options: UseStorageWithExpiryOptions = {}) {
  const storage = options.storage === 'sessionStorage' ? window.sessionStorage : window.localStorage;

  /**
   * 데이터를 스토리지에 저장합니다.
   * @param key 저장할 데이터의 키
   * @param value 저장할 데이터 (제네릭 타입)
   * @param ttl 데이터의 만료 시간 (밀리초)
   */
  const setItem = <T>(key: string, value: T, ttl: number): void => {
    const now = new Date().getTime();
    const expiry = now + ttl; // 현재 시간 + TTL
    const item: StorageItem<T> = { value, expiry };

    try {
      storage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error saving item with key "${key}" to storage:`, error);
    }
  };

  /**
   * 스토리지에서 데이터를 가져옵니다. 만료된 경우 null을 반환하고 데이터를 삭제합니다.
   * @param key 가져올 데이터의 키
   * @returns 저장된 데이터 (제네릭 타입) 또는 null
   */
  const getItem = <T>(key: string): T | null => {
    const itemStr = storage.getItem(key);
    if (!itemStr) {
      return null;
    }

    try {
      const item: StorageItem<T> = JSON.parse(itemStr);
      const now = new Date().getTime();

      if (now > item.expiry) {
        // 만료 시간이 지났으면 스토리지에서 삭제하고 null 반환
        removeItem(key);
        return null;
      }
      return item.value;
    } catch (error) {
      console.error(`Error parsing item with key "${key}" from storage:`, error);
      // 유효하지 않은 JSON 데이터는 삭제합니다.
      removeItem(key);
      return null;
    }
  };

  /**
   * 스토리지에서 데이터를 삭제합니다.
   * @param key 삭제할 데이터의 키
   */
  const removeItem = (key: string): void => {
    storage.removeItem(key);
  };

  return {
    setItem,
    getItem,
    removeItem,
  };
}
