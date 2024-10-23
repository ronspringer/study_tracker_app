import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Typography, Tabs, Tab } from '@mui/material';
import MyTextField from './forms/MyTextField';
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import StudySession from './StudySession';
import StudyProgress from './StudyProgress';
import StudyTip from './StudyTip';
import { AuthContext } from './AuthContext'; // Import AuthContext to get current user
import { Link } from 'react-router-dom';

const CreateSubject = () => {
  const { user } = useContext(AuthContext); // Get the current logged-in user from AuthContext
  const [activeTab, setActiveTab] = useState(0); // State to track the active tab
  const [subjectCreated, setSubjectCreated] = useState(false); // Track if subject has been created
  const [createdSubjectId, setCreatedSubjectId] = useState(null); // Track the created subject ID for filtering
  const [loading, setLoading] = useState(false); // State to track data fetching status
  const [myData, setMyData] = useState([]); // State to store the fetched data
  
  const defaultValues = {
    subject_name: '',
    user: user ? user.id : null,  // Assign the logged-in user ID
  };

  const schema = yup.object({
    subject_name: yup.string().required('Subject name is a required field'),
  });

  const { handleSubmit, control } = useForm({
    defaultValues: defaultValues,
    resolver: yupResolver(schema),
  });

  // Function to create a subject
  const submission = (data) => {
    AxiosInstance.post(`subject/`, {
      subject_name: data.subject_name,
      user: user ? user.id : null,  // Use the current user's ID when creating a subject
    })
      .then((response) => {
        console.log('Success:', response.data);
        setCreatedSubjectId(response.data.id); // Store the created subject's ID
        setSubjectCreated(true); // Set flag to show tabs
      })
      .catch((error) => {
        console.log('Error:', error.response.data);
      });
  };

  // Function to fetch study sessions based on the subject ID
  const getData = (subjectId) => {
    setLoading(true);  // Set loading to true while data is being fetched
    AxiosInstance.get('studysession/', {
      params: { subject: subjectId }  // Pass the subject ID to filter the results
    })
    .then((res) => {
      setMyData(res.data);
      setLoading(false);  // Set loading to false once data is fetched
    })
    .catch((err) => {
      console.error('Error fetching data:', err);
      setLoading(false);  // Handle errors and stop loading
    });
  };

  // Use effect to fetch data when a new subject is created
  useEffect(() => {
    if (createdSubjectId) {
      getData(createdSubjectId);
    }
  }, [createdSubjectId]);

  // Function to handle tab change
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Conditional rendering for tabs, only shown if a subject is created
  return (
    <div>
      <form onSubmit={handleSubmit(submission)}>
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

      {/* Only show the tabs if a subject has been created */}
      {subjectCreated && (
        <>
          <Tabs value={activeTab} onChange={handleChange} centered>
            <Tab label="Study Session" />
            <Tab label="Study Progress" />
            <Tab label="Study Tips" />
          </Tabs>

          {/* Conditionally render tab content, passing the createdSubjectId to filter the data */}
          <Box sx={{ marginTop: '20px' }}>
            {loading ? (
              <Typography>Loading...</Typography>  // Show a loading indicator while fetching data
            ) : (
              <>
                {activeTab === 0 && <StudySession subjectId={createdSubjectId} data={myData} />}
                {activeTab === 1 && <StudyProgress subjectId={createdSubjectId} />}
                {activeTab === 2 && <StudyTip subjectId={createdSubjectId} />}
              </>
            )}
          </Box>
        </>
      )}
    </div>
  );
};

export default CreateSubject;
