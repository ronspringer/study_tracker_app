import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import MyDatePickerField from './forms/MyDatePickerField';
import MyTextField from './forms/MyTextField';
import MySelectField from './forms/MySelectField';
import { useForm } from 'react-hook-form';
import AxiosInstance from './Axios';
import Dayjs from 'dayjs'
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const CreateStudyProgress = ({ subjectId, onClose }) => {
    const [subject, setSubjects] = useState();
    const [loading, setLoading] = useState(true);

    const GetData = () => {
        AxiosInstance.get('subject/').then((res) => {
            setSubjects(res.data);
            setLoading(false);
        });
    };

    useEffect(() => {
        GetData();
    }, []);

    const defaultValues = {
        total_minutes_studied: '',
        subject: subjectId || '',
    };

    const schema = yup.object({
        total_minutes_studied: yup.number().positive().integer().required('Total minutes studied is a required field'),
        last_session_date: yup.date().required('Last session date is a required field'),
        subject: yup.string().required('Subject is a required field'),
    });

    const { handleSubmit, control } = useForm({
        defaultValues:defaultValues,
        resolver: yupResolver(schema),
    });

    const submission = (data) => {
        const last_session_date = Dayjs(data.last_session_date["$d"]).format('YYYY-MM-DD')
        AxiosInstance.post('studyprogress/', {
            total_minutes_studied: data.total_minutes_studied,
            last_session_date: last_session_date,
            subject: data.subject,
        })
        .then(response => {
            console.log('Success:', response.data);
            onClose(); // Close the dialog after successful submission
        })
        .catch(error => {
            console.log('Error:', error.response.data);
        });
    };

    return (
        <div>
            {loading ? <p>Loading data...</p> : 
            <form onSubmit={handleSubmit(submission)}>
                <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
                    <Typography sx={{ marginLeft: '20px', color: '#fff' }}>Create Study Progress</Typography>
                </Box>
                <Box sx={{ display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                        <MySelectField
                            label="Subject"
                            name="subject"
                            control={control}
                            width={'33%'}
                            options={subject}
                            defaultValue={subjectId} // Default value for the subject
                            helperText="Please select subject"
                        />
                        <MyDatePickerField
                            label="Last Session Date"
                            name="last_session_date"
                            control={control}
                            width={'33%'}
                        />
                        <MyTextField
                            label="Total Minutes Studied"
                            name="total_minutes_studied"
                            control={control}
                            placeholder="Enter total minutes studied"
                            width={'33%'}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '40px' }}>
                        <Button variant="contained" type="submit" sx={{ width: '30%' }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </form>
            }
        </div>
    );
};

export default CreateStudyProgress;
