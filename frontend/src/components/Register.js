import React, { useState, useContext } from 'react'; // Import necessary libraries
import { Box, Button, Typography } from '@mui/material'; // Import Material-UI components
import MyTextField from './forms/MyTextField'; // Import custom TextField component
import MyPasswordField from './forms/MyPasswordField'; // Import custom PasswordField component
import { useForm } from 'react-hook-form'; // Import useForm hook from react-hook-form
import * as yup from 'yup'; // Import Yup for validation
import { yupResolver } from '@hookform/resolvers/yup'; // Import Yup resolver for react-hook-form
import { AuthContext } from './AuthContext'; // Import AuthContext for authentication
import { useNavigate, Link } from 'react-router-dom'; // Import navigation hooks

// Define validation schema using Yup
const schema = yup.object().shape({
  username: yup.string().required('Username is required'), // Username is required
  email: yup.string().email('Invalid email').required('Email is required'), // Email must be valid and required
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'), // Password is required and should be at least 6 characters
});

// Define the Register component
const Register = () => {
  const { register } = useContext(AuthContext); // Get register function from AuthContext
  const [loading, setLoading] = useState(false); // State to track loading status
  const [error, setError] = useState(null); // State to track any error messages
  const navigate = useNavigate(); // Get navigate function for routing

  // Initialize useForm with validation schema
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema), // Integrate Yup validation
  });

  // Submit handler for registration
  const onSubmit = async (data) => {
    setLoading(true); // Set loading to true while processing
    setError(null); // Reset error state

    try {
      // Call register function with username, email, and password
      await register(data.username, data.password, data.email);
      navigate('/login'); // Redirect to login page upon successful registration
    } catch (err) {
      setError('Registration failed. Please try again.'); // Set error message on failure
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}> {/* Handle form submission */}
      <Box 
        sx={{ 
          backgroundColor: '#00003f', // Background color
          marginBottom: '10px', // Bottom margin
          width: '50%', // Width of the box
          margin: '0 auto', // Center the box horizontally
          display: 'flex',
          justifyContent: 'center', // Center content horizontally
          alignItems: 'center', // Center content vertically
          marginTop: '6%', // Top margin
          borderTopLeftRadius: 10, // Top left corner radius
          borderTopRightRadius: 10  // Top right corner radius
        }}>
        <Typography sx={{ color: '#fff', padding: '10px 0', width: '100%' }}>
          Registration Form
        </Typography>
      </Box>

      <Box sx={{ 
          display: 'flex', 
          width: '50%', // Width of the inner box
          boxShadow: 3, // Box shadow for depth
          flexDirection: 'column', 
          marginBottom: '40px', // Bottom margin
          alignItems: 'center', // Center items horizontally
          justifyContent: 'center', // Center items vertically
          margin: '0 auto', // Center the box
          borderBottomLeftRadius: 10, // Bottom left corner radius
          borderBottomRightRadius: 10 // Bottom right corner radius
        }}>
        <MyTextField
          label="Username"
          name="username"
          control={control} // Pass control from useForm
          placeholder="Enter your username"
          width="50%"
          marginBottom="20px"
          marginTop="40px"
        />

        <MyTextField
          label="Email"
          name="email"
          control={control} // Pass control from useForm
          placeholder="Enter your email"
          width="50%"
          marginBottom="20px"
        />

        <MyPasswordField
          label="Password"
          name="password"
          control={control} // Pass control from useForm
          placeholder="Enter your password"
          width="50%"
          marginBottom="20px"
        />

        {error && <Typography color="error">{error}</Typography>} {/* Show error message if present */}

        <Box sx={{ width: '50%', marginTop: '40px' }}>
          <Button variant="contained" type="submit" sx={{ width: '100%' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'} {/* Change button text based on loading state */}
          </Button>
        </Box>

        {/* Link to navigate to Login */}
        <Typography sx={{ width: '50%', marginTop: '20px', marginBottom: '40px' }}>
          Already have an account? <Link to="/login">Login here</Link> {/* Link to login page */}
        </Typography>
      </Box>
    </form>
  );
};

// Export the Register component as the default export
export default Register;
