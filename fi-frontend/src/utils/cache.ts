class Cache {
  private store = new Map<string, { value: string; expires: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000)
    });
  }
}

export const cache = new Cache();