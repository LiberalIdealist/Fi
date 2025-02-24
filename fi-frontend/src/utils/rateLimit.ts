export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly limit = 10; // requests per minute
  private readonly window = 60000; // 1 minute in milliseconds

  async check(): Promise<boolean> {
    const now = Date.now();
    const key = 'global';
    
    let timestamps = this.requests.get(key) || [];
    timestamps = timestamps.filter(time => time > now - this.window);
    
    if (timestamps.length >= this.limit) {
      return false;
    }
    
    timestamps.push(now);
    this.requests.set(key, timestamps);
    return true;
  }
}

export const rateLimit = new RateLimiter();