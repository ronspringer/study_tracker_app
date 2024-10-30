import { React, useEffect } from 'react';  // Import React and necessary hooks
import { Box, Button, Typography } from '@mui/material';  // Import MUI components
import MyMultiLineField from './forms/MyMultiLineField';  // Import custom multi-line field component
import { useForm } from 'react-hook-form';  // Import useForm hook from react-hook-form
import AxiosInstance from './Axios';  // Import the Axios instance for API calls
import { yupResolver } from '@hookform/resolvers/yup';  // Import yupResolver for form validation
import * as yup from 'yup';  // Import yup for schema validation

// Define the EditStudyTip component
const EditStudyTip = ({ tipData, onClose }) => {  // Receive tipData and onClose props
  // Set default values for the form using tipData
  const defaultValues = {
    suggestion: tipData?.suggestion || '',  // Set suggestion or default to empty
    subject: tipData?.subject || '',  // Set subject or default to empty
  }

  // Define validation schema using yup
  const schema = yup.object({
    suggestion: yup.string().required('Suggestion is a required field'),  // Ensure suggestion is provided
  });

  // Initialize the useForm hook with default values and schema resolver
  const { handleSubmit, setValue, control } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  // Effect to set form values when tipData changes
  useEffect(() => {
    if (tipData) {
      setValue('suggestion', tipData.suggestion);  // Set the suggestion value from tipData
    }
  }, [tipData, setValue]);  // Dependency array ensures effect runs when tipData changes

  // Function to handle form submission
  const submission = (data) => {
    AxiosInstance.put(`studytip/${tipData.id}/`, {  // Send PUT request to update the study tip
      suggestion: data.suggestion,  // Suggestion from form data
      subject: tipData.subject,  // Include subject if required
    })
      .then(response => {
        console.log('Success:', response.data);  // Log success response
        onClose(); // Close the dialog after submission
      })
      .catch(error => {
        console.log('Error:', error.response.data);  // Capture and log the error from the backend
      });
  }

  // Render the component
  return (
    <div>
      <form onSubmit={handleSubmit(submission)}>  {/* Handle form submission */}
        <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
          <Typography sx={{ marginLeft: '20px', color: '#fff' }}>Edit Study Tip</Typography>
        </Box>
        <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column' }}>
          {/* Custom multi-line field for suggestion input */}
          <MyMultiLineField
            label="Suggestion"
            name="suggestion"
            control={control}
            width={'50%'}
          />
          <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '40px' }}>
            <Button variant="contained" type="submit" sx={{ width: '30%' }}>
              Save
            </Button>
          </Box>
        </Box>
      </form>
    </div>
  );
}

export default EditStudyTip;  // Export the EditStudyTip component
