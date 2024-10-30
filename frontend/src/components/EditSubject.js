import React, { useEffect, useState, useContext } from 'react';  // Import React and necessary hooks
import { Box, Button, Typography, Tabs, Tab } from '@mui/material';  // Import MUI components
import MyTextField from './forms/MyTextField';  // Import custom text field component
import { useForm } from 'react-hook-form';  // Import useForm hook from react-hook-form
import AxiosInstance from './Axios';  // Import the Axios instance for API calls
import { useNavigate, useParams, Link } from 'react-router-dom';  // Import routing hooks
import StudySession from './StudySession';  // Import StudySession component
import StudyProgress from './StudyProgress';  // Import StudyProgress component
import StudyTip from './StudyTip';  // Import StudyTip component
import { AuthContext } from './AuthContext';  // Import AuthContext for user data

// Define the EditSubject component
const EditSubject = () => {
  const { id: MyId } = useParams();  // Get the subject ID from the URL parameters
  const navigate = useNavigate();  // Hook for programmatic navigation

  const { user } = useContext(AuthContext);  // Fetch the authenticated user from context

  // State to manage active tab navigation
  const [activeTab, setActiveTab] = useState(0);
  
  // State to track whether subject data has been loaded
  const [subjectLoaded, setSubjectLoaded] = useState(false);

  // Set default values for the form
  const defaultValues = {
    subject_name: '',  // Initialize with an empty subject name
    user: user?.id || null,  // Dynamically set the user ID from the authenticated session
  };

  // Initialize the useForm hook with default values
  const { handleSubmit, setValue, control } = useForm({
    defaultValues: defaultValues,
  });

  // Function to get subject data based on the ID
  const GetData = () => {
    AxiosInstance.get(`subject/${MyId}`)  // Fetch subject data by ID
      .then((res) => {
        console.log('Fetched data:', res.data);
        setValue('subject_name', res.data.subject_name);  // Populate form with fetched subject name
        setSubjectLoaded(true);  // Subject data loaded successfully
      })
      .catch((error) => {
        console.log('Error fetching data:', error);  // Log any errors encountered
      });
  };

  // Fetch data when the component mounts
  useEffect(() => {
    GetData();  // Call GetData to fetch subject details
  }, [MyId]);  // Dependency array ensures effect runs when ID changes

  // Function to handle form submission
  const submission = (data) => {
    AxiosInstance.put(`subject/${MyId}/`, {  // Send PUT request to update the subject
      subject_name: data.subject_name,  // Subject name from form data
      user: user?.id,  // Ensure the user ID is passed dynamically
    })
      .then((response) => {
        console.log('Success:', response.data);  // Log success response
        navigate('/subject');  // Navigate to the subject list after submission
      })
      .catch((error) => {
        console.log('Error:', error.response.data);  // Log any errors encountered
      });
  };

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);  // Update the active tab state
  };

  // Render the component
  return (
    <div>
      <form onSubmit={handleSubmit(submission)}>  {/* Handle form submission */}
        <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px', padding: '10px' }}>
          <Typography sx={{ marginLeft: '20px', color: '#fff' }}>
            Edit Subject
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px' }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/subject"  // Ensure that this route matches the list page
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

      {/* Show tabs and content only if the subject has been loaded */}
      {subjectLoaded && (
        <>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Study Session" />  {/* Tab for Study Sessions */}
            <Tab label="Study Progress" />  {/* Tab for Study Progress */}
            <Tab label="Study Tips" />  {/* Tab for Study Tips */}
          </Tabs>

          {/* Conditionally render tab content */}
          <Box sx={{ marginTop: '20px' }}>
            {activeTab === 0 && <StudySession subjectId={MyId} />}  {/* Render StudySession component */}
            {activeTab === 1 && <StudyProgress subjectId={MyId} />}  {/* Render StudyProgress component */}
            {activeTab === 2 && <StudyTip subjectId={MyId} />}  {/* Render StudyTip component */}
          </Box>
        </>
      )}
    </div>
  );
};

export default EditSubject;  // Export the EditSubject component
