import React, { useState, useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import MyTextField from './forms/MyTextField'; // Assuming you have a custom TextField component
import MyPasswordField from './forms/MyPasswordField';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthContext } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Define validation schema using Yup
const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const Register = () => {
  const { register } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize useForm with validation schema
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Call register function with username, email, and password
      await register(data.username, data.password, data.email);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box 
        sx={{ 
          backgroundColor: '#00003f', 
          marginBottom: '10px', 
          width: '50%', 
          margin: '0 auto', // Centers the box horizontally
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', // Centers the text vertically
          marginTop: '6%',
          borderTopLeftRadius: 10, // Top left corner radius
          borderTopRightRadius: 10  // Top right corner radius
          
        }}>
        <Typography sx={{ color: '#fff', padding: '10px 0', width: '100%' }}>
          Registration Form
        </Typography>
      </Box>

        <Box sx={{ display: 'flex', width: '50%', boxShadow: 3, flexDirection: 'column', marginBottom: '40px',
         alignItems: 'center', justifyContent: 'center', margin: '0 auto', borderBottomLeftRadius: 10, // Top left corner radius
         borderBottomRightRadius: 10  // Top right corner radius
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

        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ width: '50%', marginTop: '40px' }}>
          <Button variant="contained" type="submit" sx={{ width: '100%' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </Box>

        {/* Link to navigate to Login */}
        <Typography sx={{ width: '50%', marginTop: '20px', marginBottom: '40px' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </Typography>
      </Box>
    </form>
  );
};

export default Register;
