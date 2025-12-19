/**
 * @file Rate Limiter Middleware
 * @module rateLimiter
 * @description Rate limiting middleware for Express applications to prevent abuse and brute force attacks.
 * Uses express-rate-limit to limit repeated requests to public endpoints.
 * @requires express-rate-limit
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for login endpoints to prevent brute force attacks.
 * Limits each IP to 5 login attempts per 15-minute window.
 * 
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 * @constant
 * @example
 * // Apply to login route
 * import { loginLimiter } from './middleware/rateLimiter';
 * app.post('/login', loginLimiter, authController.login);
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter for all API endpoints.
 * Limits each IP to 100 requests per 15-minute window.
 * 
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 * @constant
 * @example
 * // Apply to all API routes
 * import { apiLimiter } from './middleware/rateLimiter';
 * app.use('/api', apiLimiter);
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
