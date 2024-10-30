import React, { useState, useContext } from 'react'; // Import React and hooks
import { Box, Button, Typography } from '@mui/material'; // Import MUI components
import MyTextField from './forms/MyTextField'; // Import custom TextField component
import { useForm } from 'react-hook-form'; // Import useForm for form handling
import * as yup from 'yup'; // Import Yup for validation
import { yupResolver } from '@hookform/resolvers/yup'; // Import Yup resolver for react-hook-form
import { AuthContext } from './AuthContext'; // Import AuthContext for authentication
import MyPasswordField from './forms/MyPasswordField'; // Import custom PasswordField component
import { useNavigate, Link } from 'react-router-dom'; // Import routing hooks

// Define validation schema using Yup
const schema = yup.object().shape({
  username: yup.string().required('Username is required'), // Username must be a string and required
  password: yup.string().required('Password is required'), // Password must be a string and required
});

// Define the Login component
const Login = () => {
  const { login } = useContext(AuthContext); // Access the login function from AuthContext
  const [loading, setLoading] = useState(false); // Loading state for the button
  const [error, setError] = useState(null); // State to hold error messages
  const navigate = useNavigate(); // Get the navigate function for redirection

  // Initialize useForm with validation schema and get control and handleSubmit
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema), // Set Yup schema as resolver for validation
  });

  // Submit handler for the form
  const onSubmit = async (data) => {
    setLoading(true); // Set loading to true on form submission
    setError(null); // Clear previous error

    try {
      // Call login function with username, password, and navigate
      await login(data.username, data.password, navigate);
    } catch (err) {
      setError('Login failed. Please check your credentials.'); // Set error if login fails
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}> {/* Handle form submission */}
      <Box 
        sx={{ 
          backgroundColor: '#00003f', // Dark blue background
          marginBottom: '10px', 
          width: '50%', 
          margin: '0 auto', // Center the form
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '8%',
          borderTopLeftRadius: 10, 
          borderTopRightRadius: 10  
        }}>
        <Typography sx={{ color: '#fff', padding: '10px 0', width: '100%' }}>
          Login Form
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', width: '50%', boxShadow: 3, flexDirection: 'column', marginBottom: '40px',
         alignItems: 'center', justifyContent: 'center', margin: '0 auto', borderBottomLeftRadius: 10, 
         borderBottomRightRadius: 10 }}>
        <MyTextField
          label="Username"
          name="username" // Bind input to form control
          control={control} 
          placeholder="Enter your username" // Placeholder text
          width="50%"
          marginBottom='20px'
          marginTop='40px'
        />

        <MyPasswordField
          label="Password"
          name="password" // Bind input to form control
          control={control}
          placeholder="Enter your password" // Placeholder text
          width="50%"
        />

        {error && <Typography color="error">{error}</Typography>} {/* Show error message if exists */}

        <Box sx={{ width: '50%', marginTop: '40px' }}>
          <Button variant="contained" type="submit" sx={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'} {/* Change button text based on loading state */}
          </Button>
        </Box>

        <Typography sx={{ width: '50%', marginTop: '20px', marginBottom: '40px' }}>
          Don't have an account? <Link to="/register">Register here</Link> {/* Link to registration page */}
        </Typography>
      </Box>
    </form>
  );
};

// Export the Login component as default
export default Login;
