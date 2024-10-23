import { React, useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'
import MyDatePickerField from './forms/MyDatePickerField'
import MyTextField from './forms/MyTextField'
import { useForm } from 'react-hook-form'
import AxiosInstance from './Axios'
import Dayjs from 'dayjs'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const EditStudyProgress = ({ progressData, onClose }) => {

  const defaultValues = {
    total_minutes_studied: progressData?.total_minutes_studied || '',
    subject: progressData?.subject || '',
    last_session_date: progressData?.last_session_date ? Dayjs(progressData.last_session_date) : null,
  }

  const schema = yup.object({
    total_minutes_studied: yup.number('Total minutes studied must be a number').positive().integer().required('Total minutes studied is a required field'),
    last_session_date: yup.date().required('Last session date is a required field'),
  });

    const { handleSubmit, setValue, control } = useForm({defaultValues,resolver: yupResolver(schema),});

    useEffect(() => {
      if (progressData) {
        setValue('total_minutes_studied', progressData.total_minutes_studied);
        setValue('last_session_date', Dayjs(progressData.last_session_date));
      }
    }, [progressData, setValue]);
    const submission = (data) => 
      {
        const formattedLastSessionDate = Dayjs(data.last_session_date).format('YYYY-MM-DD'); // Format the selected session date
        AxiosInstance.put(`studyprogress/${progressData.id}/`,{
          total_minutes_studied: data.total_minutes_studied,
          subject: progressData.subject,
          last_session_date: formattedLastSessionDate,
        })
        .then(response => {
          console.log('Success:', response.data);
          onClose(); // Close the dialog after submission
        })
        .catch(error => {
          console.log('Error:', error.response.data);  // Capture the error from the backend
        });
    }
  return (
    <div>
      <form onSubmit={handleSubmit(submission)}>
      <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
        <Typography sx={{ marginLeft: '20px', color: '#fff' }}>
          Edit Study Progress
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column'}}>
        <Box sx={{display:'flex', justifyContent:'space-around'}}>
          <MyDatePickerField
            label="Last Session Date"
            name="last_session_date"
            control={control}
            width={'49%'}
          />
          <MyTextField
              label="Total Minutes Studied"
              name="total_minutes_studied"
              control={control}
              placeholder="Enter total minutes studied"
              width={'49%'}
          />
        </Box>
          <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '40px' }}>
            <Button variant="contained" type="submit" sx={{width:'30%'}}>
              Save
            </Button>
          </Box>
      </Box>
      </form>
    </div>
  )
}

export default EditStudyProgress