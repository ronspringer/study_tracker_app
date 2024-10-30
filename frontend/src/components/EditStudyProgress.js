import { React, useEffect } from 'react';  // Import React and necessary hooks
import { Box, Button, Typography } from '@mui/material';  // Import MUI components
import MyDatePickerField from './forms/MyDatePickerField';  // Import custom date picker component
import MyTextField from './forms/MyTextField';  // Import custom text field component
import { useForm } from 'react-hook-form';  // Import useForm hook from react-hook-form
import AxiosInstance from './Axios';  // Import the Axios instance for API calls
import Dayjs from 'dayjs';  // Import dayjs for date manipulation
import { yupResolver } from '@hookform/resolvers/yup';  // Import yupResolver for form validation
import * as yup from 'yup';  // Import yup for schema validation

// Define the EditStudyProgress component
const EditStudyProgress = ({ progressData, onClose }) => {  // Receive progressData and onClose prop

  // Set default values for the form using progressData
  const defaultValues = {
    total_minutes_studied: progressData?.total_minutes_studied || '',  // Set total minutes studied or default to empty
    subject: progressData?.subject || '',  // Set subject or default to empty
    last_session_date: progressData?.last_session_date ? Dayjs(progressData.last_session_date) : null,  // Convert last session date to Dayjs object
  };

  // Define validation schema using yup
  const schema = yup.object({
    total_minutes_studied: yup.number('Total minutes studied must be a number')  // Ensure it is a number
      .positive()  // Must be positive
      .integer()  // Must be an integer
      .required('Total minutes studied is a required field'),  // Required field with message
    last_session_date: yup.date().required('Last session date is a required field'),  // Ensure a date is provided
  });

  // Initialize the useForm hook with default values and schema resolver
  const { handleSubmit, setValue, control } = useForm({ defaultValues, resolver: yupResolver(schema) });

  // Effect to set form values when progressData changes
  useEffect(() => {
    if (progressData) {
      setValue('total_minutes_studied', progressData.total_minutes_studied);  // Set the total minutes studied
      setValue('last_session_date', Dayjs(progressData.last_session_date));  // Set the last session date
    }
  }, [progressData, setValue]);  // Dependency array ensures effect runs when progressData changes

  // Function to handle form submission
  const submission = (data) => {
    const formattedLastSessionDate = Dayjs(data.last_session_date).format('YYYY-MM-DD');  // Format the selected session date
    AxiosInstance.put(`studyprogress/${progressData.id}/`, {  // Send PUT request to update study progress
      total_minutes_studied: data.total_minutes_studied,  // Total minutes studied from form data
      subject: progressData.subject,  // Subject from original progress data
      last_session_date: formattedLastSessionDate,  // Formatted last session date
    })
    .then(response => {
      console.log('Success:', response.data);  // Log success response
      onClose(); // Close the dialog after submission
    })
    .catch(error => {
      console.log('Error:', error.response.data);  // Capture and log the error from the backend
    });
  };

  // Render the component
  return (
    <div>
      <form onSubmit={handleSubmit(submission)}>  {/* Handle form submission */}
        <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
          <Typography sx={{ marginLeft: '20px', color: '#fff' }}>
            Edit Study Progress
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <MyDatePickerField  // Custom date picker for last session date
              label="Last Session Date"
              name="last_session_date"
              control={control}  // Control from useForm
              width={'49%'}
            />
            <MyTextField  // Custom text field for total minutes studied
              label="Total Minutes Studied"
              name="total_minutes_studied"
              control={control}  // Control from useForm
              placeholder="Enter total minutes studied"
              width={'49%'}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '40px' }}>
            <Button variant="contained" type="submit" sx={{ width: '30%' }}>
              Save
            </Button>
          </Box>
        </Box>
      </form>
    </div>
  );
};

export default EditStudyProgress;  // Export the EditStudyProgress component
