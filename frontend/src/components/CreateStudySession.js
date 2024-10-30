import { React, useEffect, useState } from 'react';  // Import necessary libraries and hooks
import { Box, Button, Typography } from '@mui/material';  // Import Material UI components
import MyTextField from './forms/MyTextField';  // Import custom text field component
import MyMultiLineField from './forms/MyMultiLineField';  // Import custom multi-line text field component
import { useForm } from 'react-hook-form';  // Import useForm hook from react-hook-form
import AxiosInstance from './Axios';  // Import the Axios instance for API calls
import Dayjs from 'dayjs';  // Import Dayjs for date manipulation
import { yupResolver } from "@hookform/resolvers/yup";  // Import Yup resolver for form validation
import * as yup from "yup";  // Import Yup for validation schema
import MySelectField from './forms/MySelectField';  // Import custom select field component
import MyDateTimePickerField from './forms/MyDateTimePickerField';  // Import custom date-time picker component

// Define the CreateStudySession component, accepting subjectId and onClose as props
const CreateStudySession = ({ subjectId, onClose }) => {
    const [subject, setSubject] = useState();  // State to hold subjects
    const [loading, setLoading] = useState(true);  // State to manage loading status

    // Function to fetch subject data from the API
    const GetData = () => {
        AxiosInstance.get(`subject/`).then((res) => {
            setSubject(res.data);  // Set subjects data from API response
            console.log(res.data);  // Log the fetched subjects for debugging
            setLoading(false);  // Update loading state
        });
    };

    // useEffect to fetch subject data when the component mounts
    useEffect(() => {
        GetData();
    }, []);

    // Define default values for the form inputs
    const defaultValues = {
        duration_minutes: '',  // Initial value for duration
        notes: '',  // Initial value for notes
        subject: subjectId || '',  // Pre-fill subject with subjectId if passed
    };

    // Define validation schema using Yup
    const schema = yup.object({
        duration_minutes: yup.number('Duration must be a number').positive().integer().required('Duration is a required field'),  // Validate duration
        notes: yup.string().required('Notes is a required field'),  // Validate notes
        session_date: yup.date().required('Session date is a required field'),  // Validate session date
        subject: yup.string().required('Subject is a required field'),  // Validate subject
    });

    // Initialize react-hook-form with default values and validation schema
    const { handleSubmit, control } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),  // Use Yup for validation
    });

    // Function to handle form submission
    const submission = (data) => {
        // Format the session date to 'YYYY-MM-DD HH:mm'
        const session_date = Dayjs(data.session_date["$d"]).format('YYYY-MM-DD HH:mm');
        
        // Send POST request to save the study session
        AxiosInstance.post(`studysession/`, {
            duration_minutes: data.duration_minutes,
            notes: data.notes,
            session_date: session_date,
            subject: data.subject,
        })
        .then(response => {
            console.log('Success:', response.data);  // Log success message
            onClose(); // Close the dialog after successful submission
        })
        .catch(error => {
            console.log('Error:', error.response.data);  // Capture and log the error from the backend
        });
    };

    return (
        <div>
            {/* Display loading message if data is being fetched */}
            {loading ? <p>Loading data...</p> : 
            <form onSubmit={handleSubmit(submission)}>  {/* Handle form submission */}
                <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
                    <Typography sx={{ marginLeft: '20px', color: '#fff' }}>
                        Create Study Session
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                        {/* Dropdown for selecting subject */}
                        <MySelectField
                            label="Subject"
                            name="subject"
                            control={control}
                            width={'24%'}
                            options={subject}  // Options fetched from API
                            defaultValue={subjectId} // Default value for the subject
                            helperText="Please select subject"
                        />
                        {/* Date-time picker for selecting session date and time */}
                        <MyDateTimePickerField
                            label="Session Date & Time"
                            name="session_date"
                            control={control}
                            width={'24%'}
                        />
                        {/* Input field for study duration in minutes */}
                        <MyTextField
                            label="Duration"
                            name="duration_minutes"
                            control={control}
                            placeholder="Enter duration of study in minutes"
                            width={'24%'}
                        />
                        {/* Multi-line text field for entering notes */}
                        <MyMultiLineField
                            label="Notes"
                            name="notes"
                            control={control}
                            placeholder="Enter notes of study"
                            width={'24%'}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '40px' }}>
                        {/* Button to submit the form */}
                        <Button variant="contained" type="submit" sx={{ width: '30%' }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </form>}
        </div>
    );
};

export default CreateStudySession;  // Export the CreateStudySession component
