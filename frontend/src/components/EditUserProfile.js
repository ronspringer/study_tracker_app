import React, { useEffect, useContext, useState } from 'react';  // Import React and necessary hooks
import { useForm } from 'react-hook-form';  // Import useForm hook for form handling
import MyTextField from './forms/MyTextField';  // Import custom text field component
import MyPasswordField from './forms/MyPasswordField';  // Import custom password field component
import { AuthContext } from './AuthContext';  // Import AuthContext to access user and tokens
import AxiosInstance from './Axios';  // Import the Axios instance for API calls
import { Box, Button, Typography } from '@mui/material';  // Import MUI components
import { Link } from 'react-router-dom';  // Import Link for navigation

// Define the EditUserProfile component
export default function EditUserProfile() {
  const { user, authTokens } = useContext(AuthContext);  // Access user and authentication tokens from context
  const [isLoading, setIsLoading] = useState(true);  // Loading state for data fetching
  const [successMessage, setSuccessMessage] = useState('');  // State for success message after profile update

  // Set default values for the form
  const defaultValues = {
    username: '',  // Initialize with empty username
    first_name: '',  // Initialize with empty first name
    last_name: '',  // Initialize with empty last name
    email: '',  // Initialize with empty email
    password: '',  // Initialize with empty password
    confirmPassword: ''  // Initialize with empty confirm password
  };

  // Initialize the useForm hook with default values
  const { handleSubmit, control, setValue, setError } = useForm({
    defaultValues: defaultValues,
  });

  // Function to fetch user profile data based on user ID
  const GetData = async () => {
    try {
      // Fetch user profile data from the API
      const response = await AxiosInstance.get(`userprofile/${user.id}/`); // Adjust the endpoint as necessary
      const userData = response.data;  // Extract user data from response

      // Set form values with fetched user data
      setValue('username', userData.username);
      setValue('first_name', userData.first_name || '');  // Default to empty if not provided
      setValue('last_name', userData.last_name || '');  // Default to empty if not provided
      setValue('email', userData.email);
      setIsLoading(false);  // Data loaded successfully
    } catch (error) {
      console.error('Error fetching user profile:', error);  // Log any errors encountered
      setIsLoading(false);  // Stop loading on error
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    GetData();  // Call GetData to fetch user profile details
  }, []);  // Empty dependency array means this runs only on mount

  // Submit handler for profile update
  const onSubmit = async (data) => {
    // Check if password and confirm password match
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: "Passwords do not match" });  // Set error if they don't match
      return;  // Exit function early
    }

    try {
      // Send PUT request to update user profile
      await AxiosInstance.put(
        `userprofile/${user.id}/`,  // Correct the URL
        {
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password
        },
        { headers: { Authorization: `Bearer ${authTokens.access}` } }  // Include token for authentication
      );
      setSuccessMessage("Profile updated successfully.");  // Set success message
    } catch (error) {
      console.error("Error updating profile:", error);  // Log any errors encountered
    }
  };

  // Render loading indicator if data is still being fetched
  if (isLoading) {
    return <Typography>Loading...</Typography>;  // Optional loading indicator
  }

  // Render the profile edit form
  return (
    <form onSubmit={handleSubmit(onSubmit)}>  {/* Handle form submission */}
      <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px', padding: '10px' }}>
        <Typography sx={{ marginLeft: '20px', color: '#fff' }}>
          Edit User Profile
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}  // Link to navigate back
          to="/"  // Ensure that this route matches the home or desired page
        >
          Back
        </Button>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column', marginBottom: '40px' }}>
        {/* Form fields for user input */}
        <MyTextField label="Username" name="username" control={control} width="100%" marginBottom="16px" />
        <MyTextField label="First Name" name="first_name" control={control} width="100%" marginBottom="16px" />
        <MyTextField label="Last Name" name="last_name" control={control} width="100%" marginBottom="16px" />
        <MyTextField label="Email" name="email" control={control} width="100%" marginBottom="16px" />
        <MyPasswordField label="Password" name="password" control={control} width="100%" marginBottom="16px" />
        <MyPasswordField label="Confirm Password" name="confirmPassword" control={control} width="100%" />
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
