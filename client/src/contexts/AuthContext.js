/**
 * @file Authentication context for the application.
 * @module AuthContext
 * @description Provides authentication state and methods throughout the app.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';

/**
 * Authentication context for the application.
 * @type {React.Context}
 */
const AuthContext = createContext();

/**
 * Custom hook to access the authentication context.
 * @function useAuth
 * @returns {Object} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Provides authentication context to the application.
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to be wrapped with auth context.
 * @returns {JSX.Element} The AuthProvider component.
 */
export function AuthProvider({ children }) {
  /** @type {[Object, Function]} Current authenticated user state. */
  const [currentUser, setCurrentUser] = useState(null);
  
  /** @type {[boolean, Function]} Loading state for auth operations. */
  const [loading, setLoading] = useState(true);

  /** @type {[boolean, Function]} Admin status of the current user. */
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Handles user sign-in functionality.
   * @async
   * @function signIn
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @param {boolean} [isAdminLogin=false] - Whether this is an admin login attempt.
   * @returns {Promise<import('firebase/auth').UserCredential>} The user credential object.
   * @throws {Error} If authentication fails or if no token is received for admin login.
   */
  async function signIn(email, password, isAdminLogin = false) {
    try {
      if (isAdminLogin) {
        // For admin login, use our custom endpoint
        const response = await fetch('/api/auth/admin/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Admin authentication failed');
        }

        const { token } = await response.json();
        if (!token) {
          throw new Error('No token received from server');
        }

        // Sign in with the custom token
        const userCredential = await signInWithCustomToken(auth, token);
        // Force token refresh to get the latest claims
        await userCredential.user.getIdToken(true);
        setIsAdmin(true);
        return userCredential;
      } else {
        // Regular client login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Force token refresh to get the latest claims
        await userCredential.user.getIdToken(true);
        const token = await userCredential.user.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);
        return userCredential;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Signs out the current user.
   * @function signOut
   * @returns {Promise<void>} A promise that resolves when sign out is complete.
   */
  function signOut() {
    return firebaseSignOut(auth);
  }

  /**
   * Effect hook to set up authentication state listener.
   * @listens auth/onAuthStateChanged
   * @returns {Function} Unsubscribe function to clean up the listener.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is admin
          const token = await user.getIdTokenResult(true); // Force token refresh
          setIsAdmin(!!token.claims.admin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Authentication context value containing user state and methods.
   * @type {Object}
   * @property {Object|null} currentUser - The currently authenticated user or null.
   * @property {boolean} isAdmin - Whether the current user has admin privileges.
   * @property {Function} signIn - Function to sign in a user.
   * @property {Function} signOut - Function to sign out the current user.
   */
  const value = {
    currentUser,
    isAdmin,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
