import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

type Bucket = { count: number; resetAt: number };

@Injectable()
export class WebhookRateLimitService {
  private readonly buckets = new Map<string, Bucket>();
  private readonly windowMs = Number(process.env.WEBHOOK_RATE_LIMIT_WINDOW_MS ?? 60_000);
  private readonly maxRequests = Number(process.env.WEBHOOK_RATE_LIMIT_MAX ?? 60);

  assertAllowed(key: string) {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      this.gc(now);
      return;
    }

    if (bucket.count >= this.maxRequests) {
      throw new HttpException("Webhook rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
    }

    bucket.count += 1;
    this.buckets.set(key, bucket);
  }

  private gc(now: number) {
    if (this.buckets.size < 1000) {
      return;
    }

    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
