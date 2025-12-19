/**
 * @file Client-side entry point for the React application.
 * This file initializes the React application and mounts it to the DOM.
 */

// Import React and ReactDOM for rendering the application
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import the root App component and global styles
import App from './App';
import './index.css';

// Create a root DOM node for React 18 concurrent rendering
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application inside React's StrictMode
// StrictMode helps identify potential problems in the application during development
// It activates additional checks and warnings for its descendants
root.render(
  <React.StrictMode>
    {/* 
      The App component is the root component of the application.
      All other components will be rendered as children of this component.
    */}
    <App />
  </React.StrictMode>
);
