import React, { useState, useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import MyTextField from './forms/MyTextField'; // Assuming you have a custom TextField component
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthContext } from './AuthContext';
import MyPasswordField from './forms/MyPasswordField';
import { useNavigate, Link } from 'react-router-dom';

// Define validation schema using Yup
const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const { login } = useContext(AuthContext);  // Get login function from AuthContext
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize useForm with validation schema and get the control object
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Call login function with username, password, and navigate
      await login(data.username, data.password, navigate);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
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
          margin: '0 auto',
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
          name="username"
          control={control} 
          placeholder="Enter your username"
          width="50%"
          marginBottom= '20px'
          marginTop= '40px'
        />

        <MyPasswordField
          label="Password"
          name="password"
          control={control}
          placeholder="Enter your password"
          width="50%"
        />

        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ width: '50%', marginTop: '40px' }}>
          <Button variant="contained" type="submit" sx={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>

        <Typography sx={{ width: '50%', marginTop: '20px', marginBottom: '40px' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </Typography>
      </Box>
    </form>
  );
};

export default Login;
