/**
 * @file AdminSignIn Component
 * @module AdminSignIn
 * @description Authentication component for admin users.
 * Handles admin authentication with custom token flow and redirects to admin dashboard.
 * @requires react
 * @requires react-router-dom
 * @requires ../../config/firebase
 * @requires firebase/auth
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { signInWithCustomToken } from 'firebase/auth';

/**
 * AdminSignIn component for admin authentication.
 * Implements a custom token-based authentication flow for admin users.
 * 
 * @component
 * @returns {JSX.Element} Rendered admin sign-in form
 * 
 * @example
 * // Usage in a route
 * <Route path="/admin/login" element={<AdminSignIn />} />
 */
export default function AdminSignIn() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Navigation hook
  const navigate = useNavigate();

  /**
   * Handles form submission for admin authentication.
   * Makes an API call to get a custom token and signs in with it.
   * 
   * @async
   * @function handleSubmit
   * @param {Event} e - Form submit event
   * @returns {Promise<void>}
   * @throws {Error} If authentication fails
   */
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // Reset error state and set loading
      setError('');
      setLoading(true);
      
      // Call the admin sign-in endpoint to get a custom token
      const response = await fetch('/api/auth/admin/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Admin authentication failed');
      }

      // Parse the response data
      const data = await response.json();
      
      // Sign in with the custom token from the server
      await signInWithCustomToken(auth, data.token);
      
      // Redirect to admin dashboard on success
      navigate('/admin/dashboard');
    } catch (err) {
      // Handle and display authentication errors
      console.error('Admin sign in error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  }

  // Render the admin sign-in form
  return (
    // Main container with responsive padding and centering
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link 
              to="/login" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in as a regular user
            </Link>
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {/* Admin sign-in form */}
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          aria-label="Admin sign-in form"
        >
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in as Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
