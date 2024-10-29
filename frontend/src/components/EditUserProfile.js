import React, { useEffect, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import MyTextField from './forms/MyTextField';
import MyPasswordField from './forms/MyPasswordField';
import { AuthContext } from './AuthContext';  // Import AuthContext
import AxiosInstance from './Axios';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function EditUserProfile() {

  const { user, authTokens } = useContext(AuthContext);  // Access AuthContext
  const [isLoading, setIsLoading] = useState(true);  // Loading state
  const [successMessage, setSuccessMessage] = useState('');


  const defaultValues = {
    username: '',
    first_name: '',
    last_name: '', 
    email: '',   // Dynamically set the user ID from the authenticated session
    password: '',
    confirmPassword: ''
  };

  const { handleSubmit, control, setValue, setError } = useForm({
    defaultValues: defaultValues,
  });

  // Function to fetch user profile data based on user ID
  const GetData = async () => {
    try {
      const response = await AxiosInstance.get(`userprofile/${user.id}/`); // Adjust the endpoint as necessary
      const userData = response.data;

      // Set form values with fetched data
      setValue('username', userData.username);
      setValue('first_name', userData.first_name || '');
      setValue('last_name', userData.last_name || '');
      setValue('email', userData.email);
      setIsLoading(false);  // Data loaded successfully
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setIsLoading(false);  // Stop loading on error
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    GetData();
  }, []);

  // Submit handler for profile update
  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: "Passwords do not match" });
      return;
    }

    try {
      await AxiosInstance.put(
        `userprofile/${user.id}/`, // Correct the URL
        { username: data.username, first_name: data.first_name, last_name: data.last_name, email: data.email, password: data.password },
        { headers: { Authorization: `Bearer ${authTokens.access}` } }  // Use token for authentication
      );
      setSuccessMessage("Profile updated successfully."); // Set success message
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;  // Optional loading indicator
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px', padding: '10px' }}>
        <Typography sx={{ marginLeft: '20px', color: '#fff' }}>
          Edit User Profile
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"  // Ensure that this route matches the list page
        >
          Back
        </Button>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column', marginBottom: '40px' }}>
        <MyTextField label="Username" name="username" control={control} width="100%" marginBottom="16px" />
        <MyTextField label="First Name" name="first_name" control={control} width="100%" marginBottom="16px" />
        <MyTextField label="Last Name" name="last_name" control={control} width="100%" marginBottom="16px" />
        <MyTextField label="Email" name="email" control={control} width="100%" marginBottom="16px" />
        <MyPasswordField label="Password" name="password" control={control} width="100%" marginBottom="16px" />
        <MyPasswordField label="Confirm Password" name="confirmPassword" control={control} width="100%"/>
        <Box sx={{ width: '30%', marginTop: '40px' }}>
          <Button color="primary" variant="contained" type="submit" sx={{ width: '100%' }}>
            Save
          </Button>
        </Box>
      </Box>
      {successMessage && (  // Conditionally render the success message
        <Typography variant="body1" color="green" sx={{ textAlign: 'center' }}>
          {successMessage}
        </Typography>
      )}
    </form>
  );
}
