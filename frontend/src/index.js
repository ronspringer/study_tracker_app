import React from 'react'; // Import React library
import ReactDOM from 'react-dom/client'; // Import ReactDOM for rendering React components
import './index.css'; // Import global CSS styles
import App from './App'; // Import the main App component
import reportWebVitals from './reportWebVitals'; // Import reportWebVitals for measuring performance
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router for handling routing
import { AuthProvider } from './components/AuthContext'; // Import AuthProvider for managing authentication state

// Create a root for rendering the application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <Router> {/* Wrap the application in Router to enable routing */}
    <React.StrictMode> {/* Enables additional checks and warnings for the application */}
      <AuthProvider> {/* Provide authentication context to the application */}
        <App /> {/* Render the main App component */}
      </AuthProvider>
    </React.StrictMode>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); // Call reportWebVitals for performance measurement
