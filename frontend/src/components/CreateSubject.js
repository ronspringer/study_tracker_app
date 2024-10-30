import React, { useState, useEffect, useContext } from 'react';  // Import necessary libraries and hooks
import { Box, Button, Typography, Tabs, Tab } from '@mui/material';  // Import Material UI components
import MyTextField from './forms/MyTextField';  // Import custom text field component
import { useForm } from 'react-hook-form';  // Import useForm hook from react-hook-form
import AxiosInstance from './Axios';  // Import the Axios instance for API calls
import { yupResolver } from "@hookform/resolvers/yup";  // Import yupResolver for validation
import * as yup from "yup";  // Import yup for schema validation
import StudySession from './StudySession';  // Import StudySession component
import StudyProgress from './StudyProgress';  // Import StudyProgress component
import StudyTip from './StudyTip';  // Import StudyTip component
import { AuthContext } from './AuthContext'; // Import AuthContext to get current user
import { Link } from 'react-router-dom';  // Import Link for navigation

// Define the CreateSubject component
const CreateSubject = () => {
  const { user } = useContext(AuthContext); // Get the current logged-in user from AuthContext
  const [activeTab, setActiveTab] = useState(0); // State to track the active tab (default to the first tab)
  const [subjectCreated, setSubjectCreated] = useState(false); // Track if subject has been created
  const [createdSubjectId, setCreatedSubjectId] = useState(null); // Track the created subject ID for filtering
  const [loading, setLoading] = useState(false); // State to track data fetching status
  const [myData, setMyData] = useState([]); // State to store the fetched study session data
  
  // Default values for the form inputs
  const defaultValues = {
    subject_name: '',
    user: user ? user.id : null,  // Assign the logged-in user ID
  };

  // Schema validation using yup
  const schema = yup.object({
    subject_name: yup.string().required('Subject name is a required field'), // Subject name must be a string and is required
  });

  // Initialize react-hook-form with default values and validation resolver
  const { handleSubmit, control } = useForm({
    defaultValues: defaultValues,
    resolver: yupResolver(schema),
  });

  // Function to create a subject
  const submission = (data) => {
    // Make a POST request to create a new subject
    AxiosInstance.post(`subject/`, {
      subject_name: data.subject_name,  // Capture the subject name from the form input
      user: user ? user.id : null,  // Use the current user's ID when creating a subject
    })
      .then((response) => {
        console.log('Success:', response.data);  // Log the success message
        setCreatedSubjectId(response.data.id); // Store the created subject's ID
        setSubjectCreated(true); // Set flag to indicate that the subject has been created
      })
      .catch((error) => {
        console.log('Error:', error.response.data);  // Log any errors from the backend
      });
  };

  // Function to fetch study sessions based on the subject ID
  const getData = (subjectId) => {
    setLoading(true);  // Set loading to true while data is being fetched
    // Make a GET request to fetch study sessions for the specified subject ID
    AxiosInstance.get('studysession/', {
      params: { subject: subjectId }  // Pass the subject ID as a query parameter
    })
    .then((res) => {
      setMyData(res.data);  // Set the fetched data to myData state
      setLoading(false);  // Set loading to false once data is fetched
    })
    .catch((err) => {
      console.error('Error fetching data:', err);  // Log any errors encountered during the fetch
      setLoading(false);  // Handle errors and stop loading
    });
  };

  // useEffect to fetch study session data when a new subject is created
  useEffect(() => {
    if (createdSubjectId) {  // Check if a subject has been created
      getData(createdSubjectId);  // Fetch the study sessions for the created subject
    }
  }, [createdSubjectId]);  // Dependency array to re-run effect when createdSubjectId changes

  // Function to handle tab change
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);  // Update the active tab state
  };

  // Render the component
  return (
    <div>
      <form onSubmit={handleSubmit(submission)}>  {/* Handle form submission */}
        <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px', padding: '10px' }}>
          <Typography sx={{ marginLeft: '20px', color: '#fff' }}>
            Create Subject
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px' }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/subject"  // Navigate back to the subject list page
          >
            Back
          </Button>
        </Box>

        <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column', marginBottom: '40px' }}>
          <MyTextField
            label="Name"
            name="subject_name"
            control={control}
            placeholder="Enter name of subject"
            width={'30%'}
          />
          <Box sx={{ width: '30%', marginTop: '40px' }}>
            <Button variant="contained" type="submit" sx={{ width: '100%' }}>
              Save
            </Button>
          </Box>
        </Box>
      </form>

      {/* Only show the tabs if a subject has been created */}
      {subjectCreated && (
        <>
          <Tabs value={activeTab} onChange={handleChange} centered>
            <Tab label="Study Session" />  {/* Tab for study sessions */}
            <Tab label="Study Progress" />  {/* Tab for study progress */}
            <Tab label="Study Tips" />  {/* Tab for study tips */}
          </Tabs>

          {/* Conditionally render tab content, passing the createdSubjectId to filter the data */}
          <Box sx={{ marginTop: '20px' }}>
            {loading ? (
              <Typography>Loading...</Typography>  // Show a loading indicator while fetching data
            ) : (
              <>
                {activeTab === 0 && <StudySession subjectId={createdSubjectId} data={myData} />}  {/* Render StudySession tab content */}
                {activeTab === 1 && <StudyProgress subjectId={createdSubjectId} />}  {/* Render StudyProgress tab content */}
                {activeTab === 2 && <StudyTip subjectId={createdSubjectId} />}  {/* Render StudyTip tab content */}
              </>
            )}
          </Box>
        </>
      )}
    </div>
  );
};

export default CreateSubject;  // Export the CreateSubject component
