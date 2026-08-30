import { createHash } from 'crypto';

// In-memory store for sliding window rate limiting
const rateLimitStore = new Map();

/**
 * Rate limit configuration strictly for unauthenticated public email forms.
 * (Add/Edit routes are unrestricted for agents; Auth OTP is rate-limited by Supabase)
 */
const RATE_LIMITS = {
	inquiry: { max: 5, windowMs: 60 * 60 * 1000 }, // 5 inquiries per hour per IP
	contact: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 contact messages per hour per IP
};

/**
 * Extract client identifier from request (IP or proxy header)
 */
export function getClientId(request) {
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}
	const ua = request.headers.get('user-agent') || '';
	const ref = request.headers.get('referer') || '';
	return createHash('sha256').update(ua + ref).digest('hex').substring(0, 16);
}

/**
 * Check and record rate limit for an action
 * @param {string} key
 * @param {{ max: number, windowMs: number }} config
 * @returns {{ allowed: boolean, remaining: number, resetAt: number, retryAfter: number }}
 */
export function checkRateLimit(key, config) {
	const now = Date.now();
	let record = rateLimitStore.get(key);

	if (!record || record.resetAt < now) {
		record = {
			count: 0,
			resetAt: now + config.windowMs,
		};
	}

	// Clean up stale entries periodically
	if (rateLimitStore.size > 5000) {
		for (const [k, v] of rateLimitStore.entries()) {
			if (v.resetAt < now) rateLimitStore.delete(k);
		}
	}

	record.count++;
	rateLimitStore.set(key, record);

	const remaining = Math.max(0, config.max - record.count);
	const allowed = record.count <= config.max;

	return {
		allowed,
		remaining,
		resetAt: record.resetAt,
		retryAfter: allowed ? 0 : Math.ceil((record.resetAt - now) / 1000),
	};
}

/**
 * Apply rate limit check to a specific form action ('inquiry' or 'contact')
 */
export function applyRateLimit(request, actionName) {
	const config = RATE_LIMITS[actionName];
	if (!config) return { allowed: true, remaining: 999, resetAt: 0, retryAfter: 0 };

	const clientId = getClientId(request);
	const key = `${actionName}:${clientId}`;
	return checkRateLimit(key, config);
}
