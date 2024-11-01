import { React, useEffect } from 'react';  // Import React and necessary hooks
import { Box, Button, Typography } from '@mui/material';  // Import MUI components
import MyTextField from './forms/MyTextField';  // Import custom text field component
import MyMultiLineField from './forms/MyMultiLineField';  // Import custom multi-line text field component
import MyDateTimePickerField from './forms/MyDateTimePickerField';  // Import custom date-time picker component
import { useForm } from 'react-hook-form';  // Import useForm hook from react-hook-form
import AxiosInstance from './Axios';  // Import the Axios instance for API calls
import Dayjs from 'dayjs';  // Import dayjs for date manipulation
import { yupResolver } from '@hookform/resolvers/yup';  // Import yupResolver for form validation
import * as yup from 'yup';  // Import yup for schema validation

// Define the EditStudySession component
const EditStudySession = ({ sessionData, onClose }) => {  // Receive sessionData and onClose prop

  // Set default values for the form using sessionData
  const defaultValues = {
    duration_minutes: sessionData?.duration_minutes || '',  // Set duration or default to empty
    notes: sessionData?.notes || '',  // Set notes or default to empty
    session_date: sessionData?.session_date ? Dayjs(sessionData.session_date) : null,  // Convert session date to Dayjs object
    subject: sessionData?.subject || '',  // Set subject or default to empty
  };

  // Define validation schema using yup
  const schema = yup.object({
    duration_minutes: yup.number('Duration must be a number')  // Ensure it is a number
      .positive()  // Must be positive
      .integer()  // Must be an integer
      .required('Duration is a required field'),  // Required field with message
    notes: yup.string().required('Notes is a required field'),  // Ensure notes are provided
    session_date: yup.date().required('Session date is a required field'),  // Ensure a date is provided
  });

  // Initialize the useForm hook with default values and schema resolver
  const { handleSubmit, setValue, control } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  // Effect to set form values when sessionData changes
  useEffect(() => {
    if (sessionData) {
      setValue('duration_minutes', sessionData.duration_minutes);  // Set duration minutes
      setValue('notes', sessionData.notes);  // Set notes
      setValue('session_date', Dayjs(sessionData.session_date));  // Set session date
    }
  }, [sessionData, setValue]);  // Dependency array ensures effect runs when sessionData changes

  // Function to handle form submission
  const submission = (data) => {
    const formattedSessionDate = Dayjs(data.session_date).format('YYYY-MM-DD HH:mm');  // Format the selected session date
  
    AxiosInstance.put(`studysession/${sessionData.id}/`, {  // Send PUT request to update study session
      duration_minutes: data.duration_minutes,  // Duration from form data
      notes: data.notes,  // Notes from form data
      session_date: formattedSessionDate,  // Use the formatted date
      subject: sessionData.subject,  // Subject from original session data
    })
      .then((response) => {
        console.log('Success:', response.data);  // Log success response
        onClose(); // Close the dialog after submission
      })
      .catch((error) => {
        console.log('Error:', error.response.data);  // Capture and log the error from the backend
      });
  };

  // Render the component
  return (
    <form onSubmit={handleSubmit(submission)}>  {/* Handle form submission */}
      <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
        <Typography sx={{ marginLeft: '20px', color: '#fff' }}>Edit Study Session</Typography>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          {/* Custom date-time picker for session date */}
          <MyDateTimePickerField label="Session Date & Time" name="session_date" control={control} width={'33%'} />
          {/* Custom text field for duration of study in minutes */}
          <MyTextField label="Duration" name="duration_minutes" control={control} placeholder="Enter duration of study in minutes" width={'33%'} />
          {/* Custom multi-line field for notes */}
          <MyMultiLineField label="Notes" name="notes" control={control} placeholder="Enter notes of study" width={'33%'} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '40px' }}>
          <Button variant="contained" type="submit" sx={{ width: '30%' }}>
            Save
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default EditStudySession;  // Export the EditStudySession component
