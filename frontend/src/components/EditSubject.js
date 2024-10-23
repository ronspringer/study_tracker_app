import React, { useEffect, useState, useContext } from 'react';
import { Box, Button, Typography, Tabs, Tab } from '@mui/material';
import MyTextField from './forms/MyTextField';
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import StudySession from './StudySession';  
import StudyProgress from './StudyProgress';
import StudyTip from './StudyTip';
import { AuthContext } from './AuthContext';  // Assuming you have an AuthContext for user data

const EditSubject = () => {
  const { id: MyId } = useParams();  // Destructured directly from useParams
  const navigate = useNavigate();
  
  const { user } = useContext(AuthContext);  // Fetch the authenticated user from context

  // State to manage tab navigation
  const [activeTab, setActiveTab] = useState(0);
  
  // State to track whether subject data has been loaded
  const [subjectLoaded, setSubjectLoaded] = useState(false);

  const defaultValues = {
    subject_name: '',
    user: user?.id || null,  // Dynamically set the user ID from the authenticated session
  };

  const { handleSubmit, setValue, control } = useForm({
    defaultValues: defaultValues,
  });

  // Function to get subject data based on the ID
  const GetData = () => {
    AxiosInstance.get(`subject/${MyId}`)
      .then((res) => {
        console.log('Fetched data:', res.data);
        setValue('subject_name', res.data.subject_name);  // Populate form with fetched data
        setSubjectLoaded(true);  // Subject data loaded successfully
      })
      .catch((error) => {
        console.log('Error fetching data:', error);
      });
  };

  // Fetch data when the component mounts
  useEffect(() => {
    GetData();
  }, [MyId]);  // Add MyId as a dependency to run when ID changes

  // Function to handle form submission
  const submission = (data) => {
    AxiosInstance.put(`subject/${MyId}/`, {
      subject_name: data.subject_name,
      user: user?.id,  // Ensure the user ID is passed dynamically
    })
      .then((response) => {
        console.log('Success:', response.data);
        navigate('/subject');  // Navigate to the subject list or another appropriate page after submission
      })
      .catch((error) => {
        console.log('Error:', error.response.data);  // Log any errors
      });
  };

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(submission)}>
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
            <Tab label="Study Session" />
            <Tab label="Study Progress" />
            <Tab label="Study Tips" />
          </Tabs>

          {/* Conditionally render tab content */}
          <Box sx={{ marginTop: '20px' }}>
            {activeTab === 0 && <StudySession subjectId={MyId} />}  {/* Pass subject ID */}
            {activeTab === 1 && <StudyProgress subjectId={MyId} />}  {/* Pass subject ID */}
            {activeTab === 2 && <StudyTip subjectId={MyId} />}  {/* Pass subject ID */}
          </Box>
        </>
      )}
    </div>
  );
};

export default EditSubject;
