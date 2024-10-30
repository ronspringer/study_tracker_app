import { React, useEffect, useState } from 'react';  // Import necessary libraries and hooks
import { Box, Button, Typography } from '@mui/material';  // Import Material UI components
import MyMultiLineField from './forms/MyMultiLineField';  // Import custom multi-line text field component
import MySelectField from './forms/MySelectField';  // Import custom select field component
import { useForm } from 'react-hook-form';  // Import useForm hook from react-hook-form
import AxiosInstance from './Axios';  // Import the Axios instance for API calls

// Define the CreateStudyTip component, accepting subjectId and onClose as props
const CreateStudyTip = ({ subjectId, onClose }) => {
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
        suggestion: '',  // Initial value for suggestion
        subject: subjectId || '',  // Pre-fill subject with subjectId if passed
    };

    // Initialize react-hook-form with default values
    const { handleSubmit, control } = useForm({ defaultValues: defaultValues });

    // Function to handle form submission
    const submission = (data) => {
        // Send POST request to save the study tip
        AxiosInstance.post(`studytip/`, {
            suggestion: data.suggestion,  // Capture the suggestion input
            subject: data.subject,  // Capture the selected subject
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
                        Create Study Tip
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                        {/* Dropdown for selecting subject */}
                        <MySelectField
                            label="Subject"
                            name="subject"
                            control={control}
                            width={'48%'}
                            options={subject}  // Options fetched from API
                            defaultValue={subjectId} // Default value for the subject
                            helperText="Please select subject"
                        />
                        {/* Multi-line text field for entering suggestion */}
                        <MyMultiLineField
                            label="Suggestion"
                            name="suggestion"
                            control={control}
                            width={'48%'}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '40px' }}>
                        {/* Button to submit the form */}
                        <Button variant="contained" type="submit" sx={{ width: '30%' }}>
                            Save
                        </Button>
                    </Box>
                    <Box />  {/* Placeholder for layout */}
                </Box>
            </form>}
        </div>
    );
};

export default CreateStudyTip;  // Export the CreateStudyTip component
