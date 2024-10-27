import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';  // Import DateTimePicker
import { Controller } from 'react-hook-form';
import Dayjs from 'dayjs';

export default function MyDateTimePickerField(props) {
    const { label, control, width, name } = props;
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <DateTimePicker  // Use DateTimePicker
                        label={label}
                        sx={{ width: { width } }}
                        value={value ? Dayjs(value).tz('America/New_York') : null}
                        onChange={onChange}
                        slotProps={{
                            textField: {
                                error: !!error,
                                helperText: error?.message,
                            }
                        }}
                    />
                )}
            />
        </LocalizationProvider>
    );
}
