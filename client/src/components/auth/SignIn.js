/**
 * @file SignIn Component
 * @module SignIn
 * @description Authentication component for regular user sign-in.
 * Handles user authentication and redirects to the appropriate dashboard.
 * @requires react
 * @requires react-router-dom
 * @requires ../../contexts/AuthContext
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './SignIn.css';
/**
 * SignIn component for user authentication.
 * Handles form submission, validation, and authentication state.
 * 
 * @component
 * @returns {JSX.Element} Rendered sign-in form
 * 
 * @example
 * // Usage in a route
 * <Route path="/login" element={<SignIn />} />
 */
function SignIn() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Authentication context
  const { signIn } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles form submission for user sign-in.
   * 
   * @async
   * @function handleSubmit
   * @param {Event} e - Form submit event
   * @param {boolean} [isAdmin=false] - Whether this is an admin sign-in attempt
   * @returns {Promise<void>}
   */
  async function handleSubmit(e, isAdmin = false) {
    e.preventDefault();

    try {
      // Reset error state and set loading
      setError('');
      setLoading(true);
      
      // Attempt to sign in using AuthContext
      await signIn(email, password, isAdmin);
      
      // Redirect based on user type
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      // Handle authentication errors
      setError(`Failed to sign in: ${isAdmin ? 'Admin ' : ''}${err.message}`);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  }

  // Render the sign-in form
  return (
    // Main container with responsive padding and centering
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            <Link 
              to="/admin/login" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in as admin
            </Link>
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="mt-8 space-y-6">
          {/* Client sign-in form */}
          <form 
            onSubmit={(e) => handleSubmit(e, false)} 
            className="space-y-6"
            aria-label="Client sign-in form"
          >
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
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Signing in...' : 'Sign in as Client'}
                </button>
              </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
