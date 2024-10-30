import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import MyDatePickerField from './forms/MyDatePickerField';
import MyTextField from './forms/MyTextField';
import MySelectField from './forms/MySelectField';
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios';
import Dayjs from 'dayjs';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Define the CreateStudyProgress component, accepting subjectId and onClose as props
const CreateStudyProgress = ({ subjectId, onClose }) => {
    // State to hold subjects and loading status
    const [subject, setSubjects] = useState();
    const [loading, setLoading] = useState(true);

    // Function to fetch subject data from the API
    const GetData = () => {
        AxiosInstance.get('subject/')
            .then((res) => {
                setSubjects(res.data);  // Set subjects data from API response
                setLoading(false);  // Update loading state
            });
    };

    // useEffect to fetch subject data when the component mounts
    useEffect(() => {
        GetData();
    }, []);

    // Define default values for the form
    const defaultValues = {
        total_minutes_studied: '',  // Initial value for total minutes studied
        subject: subjectId || '',  // Set subject ID or empty string
    };

    // Validation schema using Yup
    const schema = yup.object({
        total_minutes_studied: yup.number().positive().integer().required('Total minutes studied is a required field'),
        last_session_date: yup.date().required('Last session date is a required field'),
        subject: yup.string().required('Subject is a required field'),
    });

    // Initialize react-hook-form with default values and validation schema
    const { handleSubmit, control } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
    });

    // Function to handle form submission
    const submission = (data) => {
        // Format the last session date to 'YYYY-MM-DD'
        const last_session_date = Dayjs(data.last_session_date["$d"]).format('YYYY-MM-DD');
        
        // Send POST request to save study progress
        AxiosInstance.post('studyprogress/', {
            total_minutes_studied: data.total_minutes_studied,
            last_session_date: last_session_date,
            subject: data.subject,
        })
        .then(response => {
            console.log('Success:', response.data);  // Log success message
            onClose(); // Close the dialog after successful submission
        })
        .catch(error => {
            console.log('Error:', error.response.data);  // Log error message
        });
    };

    return (
        <div>
            {/* Display loading message if data is being fetched */}
            {loading ? <p>Loading data...</p> : 
            <form onSubmit={handleSubmit(submission)}>
                <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
                    <Typography sx={{ marginLeft: '20px', color: '#fff' }}>Create Study Progress</Typography>
                </Box>
                <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                        {/* Dropdown for selecting subject */}
                        <MySelectField
                            label="Subject"
                            name="subject"
                            control={control}
                            width={'33%'}
                            options={subject}  // Options fetched from API
                            defaultValue={subjectId} // Default value for the subject
                            helperText="Please select subject"
                        />
                        {/* Date picker for selecting last session date */}
                        <MyDatePickerField
                            label="Last Session Date"
                            name="last_session_date"
                            control={control}
                            width={'33%'}
                        />
                        {/* Input field for total minutes studied */}
                        <MyTextField
                            label="Total Minutes Studied"
                            name="total_minutes_studied"
                            control={control}
                            placeholder="Enter total minutes studied"
                            width={'33%'}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '40px' }}>
                        {/* Button to submit the form */}
                        <Button variant="contained" type="submit" sx={{ width: '30%' }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </form>
            }
        </div>
    );
};

export default CreateStudyProgress;
