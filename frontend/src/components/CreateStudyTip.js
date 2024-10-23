import { React, useEffect, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import MyMultiLineField from './forms/MyMultiLineField'
import MySelectField from './forms/MySelectField';
import { useForm } from 'react-hook-form'
import AxiosInstance from './Axios'

const CreateStudyTip = ({ subjectId, onClose }) => { // Receive subjectId and onClose prop

    const [subject,setSubject] = useState()
    const [loading,setLoading] = useState(true)

    const GetData = () => {
        AxiosInstance.get(`subject/`).then((res) => {
            setSubject(res.data)
            console.log(res.data)
            setLoading(false)
          })
    }
    useEffect(()=> {
        GetData();
    },[])

    const defaultValues = {
      suggestion: '',
      subject: subjectId || '', // Pre-fill subject with subjectId if passed
    }
    const { handleSubmit, control } = useForm({defaultValues:defaultValues});
    const submission = (data) => 
      {
        AxiosInstance.post(`studytip/`, {
          suggestion: data.suggestion,
          subject: data.subject,  // if required
        })
        .then(response => {
          console.log('Success:', response.data);
          onClose(); // Close the dialog after successful submission
        })
        .catch(error => {
          console.log('Error:', error.response.data);  // Capture the error from the backend
        });
      }
  return (
    <div>
      { loading ? <p>Loading data...</p>:
        <form onSubmit={handleSubmit(submission)}>
      <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
        <Typography sx={{ marginLeft: '20px', color: '#fff' }}>
          Create Study Tip
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column'}}>
      <Box sx={{display:'flex', justifyContent:'space-around'}}>
          <MySelectField
                  label="Subject"
                  name="subject"
                  control={control}
                  width={'48%'}
                  options={subject}
                  defaultValue={subjectId} // Default value for the subject
                  helperText="Please select subject"
          />
          <MyMultiLineField
              label="Suggestion"
              name="suggestion"
              control={control}
              width={'48%'}
          />
          </Box>
          <Box sx={{display:'flex', justifyContent:'start', marginTop: '40px'}}>
            <Button variant="contained" type="submit" sx={{width:'30%'}}>
              Save
            </Button>
          </Box>
      <Box/>
      </Box>
      </form>}
    </div>
  )
}

export default CreateStudyTip