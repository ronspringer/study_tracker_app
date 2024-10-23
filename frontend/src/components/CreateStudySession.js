import { React, useEffect, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import MyDatePickerField from './forms/MyDatePickerField'
import MyTextField from './forms/MyTextField'
import MyMultiLineField from './forms/MyMultiLineField'
import { useForm } from 'react-hook-form'
import AxiosInstance from './Axios'
import Dayjs from 'dayjs'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import MySelectField from './forms/MySelectField'

const CreateStudySession = ({ subjectId, onClose }) => { // Receive subjectId and onClose prop
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
        duration_minutes: '',
        notes: '',
        subject: subjectId || '', // Pre-fill subject with subjectId if passed
      }

    const schema = yup
    .object({
      duration_minutes: yup.number('Duration must be a number').positive().integer().required('Duration is a required field'),
      notes: yup.string().required('Notes is a required field'),
      session_date: yup.date().required('Session date is a required field'),
      subject: yup.string().required('Subject is a required field'),
    })
      
    const { handleSubmit, control } = useForm({defaultValues:defaultValues, resolver: yupResolver(schema)});
    const submission = (data) => 
    {
        const session_date = Dayjs(data.session_date["$d"]).format('YYYY-MM-DD')
        AxiosInstance.post(`studysession/`,{
          duration_minutes: data.duration_minutes,
          notes: data.notes,
          session_date: session_date,
          subject: data.subject,
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
          Create Study Session
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column'}}>
        <Box sx={{display:'flex', justifyContent:'space-around'}}>
          <MySelectField
                label="Subject"
                name="subject"
                control={control}
                width={'24%'}
                options={subject}
                defaultValue={subjectId} // Default value for the subject
                helperText="Please select subject"
          />
          <MyDatePickerField
            label="Session Date"
            name="session_date"
            control={control}
            width={'24%'}
          />
          <MyTextField
              label="Duration"
              name="duration_minutes"
              control={control}
              placeholder="Enter duration of study in minutes"
              width={'24%'}
          />
          <MyMultiLineField
              label="Notes"
              name="notes"
              control={control}
              placeholder="Enter notes of study"
              width={'24%'}
          />
        </Box>
        <Box sx={{display:'flex', justifyContent:'start', marginTop: '40px'}}>
            <Button variant="contained" type="submit" sx={{width:'30%'}}>
              Save
            </Button>
        </Box>
      </Box>
      </form>}
    </div>
  )
}

export default CreateStudySession