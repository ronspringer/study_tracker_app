import { React, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import MyTextField from './forms/MyTextField';
import MyMultiLineField from './forms/MyMultiLineField';
import MyDateTimePickerField from './forms/MyDateTimePickerField';
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios';
import Dayjs from 'dayjs';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
Dayjs.extend(utc);
Dayjs.extend(timezone);

const EditStudySession = ({ sessionData, onClose }) => {
  const defaultValues = {
    duration_minutes: sessionData?.duration_minutes || '',
    notes: sessionData?.notes || '',
    session_date: sessionData?.session_date ? Dayjs(sessionData.session_date) : null,
    subject: sessionData?.subject || '',
  };

  const schema = yup.object({
    duration_minutes: yup.number('Duration must be a number').positive().integer().required('Duration is a required field'),
    notes: yup.string().required('Notes is a required field'),
    session_date: yup.date().required('Session date is a required field'),
  });

  const { handleSubmit, setValue, control } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (sessionData) {
      setValue('duration_minutes', sessionData.duration_minutes);
      setValue('notes', sessionData.notes);
      setValue('session_date', Dayjs(sessionData.session_date));
    }
  }, [sessionData, setValue]);

  const submission = (data) => {
    const formattedSessionDate = Dayjs(data.session_date).format('YYYY-MM-DD HH:mm'); // Format the selected session date
  
    AxiosInstance.put(`studysession/${sessionData.id}/`, {
      duration_minutes: data.duration_minutes,
      notes: data.notes,
      session_date: formattedSessionDate, // Use the formatted date
      subject: sessionData.subject,
    })
      .then((response) => {
        console.log('Success:', response.data);
        onClose(); // Close the dialog after submission
      })
      .catch((error) => {
        console.log('Error:', error.response.data);
      });
  };
  

  return (
    <form onSubmit={handleSubmit(submission)}>
      <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
        <Typography sx={{ marginLeft: '20px', color: '#fff' }}>Edit Study Session</Typography>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          {/* <MyDatePickerField label="Session Date" name="session_date" control={control} width={'33%'} /> */}
          <MyDateTimePickerField label="Session Date & Time" name="session_date" control={control} width={'33%'}  />
          <MyTextField label="Duration" name="duration_minutes" control={control} placeholder="Enter duration of study in minutes" width={'33%'} />
          <MyMultiLineField label="Notes" name="notes" control={control} placeholder="Enter notes of study" width={'33%'} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '40px' }}>
          <Button variant="contained" type="submit" sx={{ width: '30%' }}>
            Save
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default EditStudySession;
