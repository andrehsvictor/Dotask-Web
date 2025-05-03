import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly prefix: string = 'dotask_';

  constructor(private logger: LoggerService) { }

  set(key: string, value: any): void {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serializedValue);
      this.logger.debug(`LocalStorage: Item set with key "${key}"`);
    } catch (error) {
      this.logger.error('Error setting localStorage item:', error);
    }
  }

  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const item = localStorage.getItem(prefixedKey);

      if (item === null) {
        this.logger.debug(`LocalStorage: Item with key "${key}" not found, using default value`);
        return defaultValue;
      }

      this.logger.debug(`LocalStorage: Item retrieved with key "${key}"`);
      return JSON.parse(item) as T;
    } catch (error) {
      this.logger.error(`Error getting localStorage item '${key}':`, error);
      return defaultValue;
    }
  }

  has(key: string): boolean {
    const prefixedKey = this.getKeyWithPrefix(key);
    const exists = localStorage.getItem(prefixedKey) !== null;
    this.logger.debug(`LocalStorage: Check if key "${key}" exists: ${exists}`);
    return exists;
  }

  remove(key: string): void {
    const prefixedKey = this.getKeyWithPrefix(key);
    localStorage.removeItem(prefixedKey);
    this.logger.debug(`LocalStorage: Item with key "${key}" removed`);
  }

  clear(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.logger.info(`LocalStorage: Cleared ${keysToRemove.length} application items`);
  }

  clearAll(): void {
    localStorage.clear();
    this.logger.warn('LocalStorage: All items cleared (including non-application items)');
  }

  getSize(): number {
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length;
      }
    }

    const sizeInKB = (totalSize * 2) / 1024;
    this.logger.debug(`LocalStorage: Current size is approximately ${sizeInKB.toFixed(2)} KB`);
    return totalSize * 2;
  }

  private getKeyWithPrefix(key: string): string {
    return `${this.prefix}${key}`;
  }

  isAvailable(): boolean {
    const testKey = '__test__';

    try {
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      this.logger.error('LocalStorage is not available:', e);
      return false;
    }
  }

  getAllKeys(): string[] {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }

    this.logger.debug(`LocalStorage: Found ${keys.length} application keys`);
    return keys;
  }
}