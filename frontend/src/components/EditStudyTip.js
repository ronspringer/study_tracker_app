import { React, useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'
import MyMultiLineField from './forms/MyMultiLineField'
import { useForm } from 'react-hook-form'
import AxiosInstance from './Axios'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const EditStudyTip = ({ tipData, onClose }) => {
  const defaultValues = {
    suggestion: tipData?.suggestion || '',
    subject: tipData?.subject || '',
  }

  const schema = yup.object({
    suggestion: yup.string().required('Suggestion is a required field'),
  })

  const { handleSubmit, setValue, control } = useForm({
    defaultValues,
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (tipData) {
      setValue('suggestion', tipData.suggestion);
    }
  }, [tipData, setValue]);


    const submission = (data) => 
      {
        AxiosInstance.put(`studytip/${tipData.id}/`, {
          suggestion: data.suggestion,
          subject: tipData.subject,  // if required
        })
        .then(response => {
          console.log('Success:', response.data);
          onClose(); // Close the dialog after submission
        })
        .catch(error => {
          console.log('Error:', error.response.data);  // Capture the error from the backend
        })
      }
  return (
    <div>
        <form onSubmit={handleSubmit(submission)}>
      <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
        <Typography sx={{ marginLeft: '20px', color: '#fff' }}>
          Edit Study Tip
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column'}}>
          <MyMultiLineField
              label="Suggestion"
              name="suggestion"
              control={control}
              width={'50%'}
          />
          <Box sx={{display:'flex', justifyContent:'start', marginTop: '40px'}}>
            <Button variant="contained" type="submit" sx={{width:'30%'}}>
              Save
            </Button>
          </Box>
      <Box/>
      </Box>
      </form>
    </div>
  )
}

export default EditStudyTip