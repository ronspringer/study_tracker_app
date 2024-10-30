import * as React from 'react';  // Importing React library
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';  // Adapter for Dayjs date library
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';  // Provider for date localization
import { DatePicker } from '@mui/x-date-pickers/DatePicker';  // DatePicker component from MUI
import { Controller } from 'react-hook-form';  // Controller component for integrating with React Hook Form

// MyDatePickerField functional component
export default function MyDatePickerField(props) {
    // Destructure props for easy access to necessary properties
    const { label, control, width, name } = props;

    return (
        // Provide localization for date handling
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
                name={name}  // Name of the field in the form
                control={control}  // Control object from React Hook Form
                render={({
                    field: { onChange, value },  // Destructure field methods from Controller
                    fieldState: { error },  // Destructure error state for validation
                }) => (
                    // Render the DatePicker component
                    <DatePicker
                        label={label}  // Label for the DatePicker
                        sx={{ width: { width } }}  // Style the DatePicker with the specified width
                        value={value}  // Current value of the DatePicker
                        onChange={onChange}  // Handler for change events
                        slotProps={{
                            textField: {
                                error: !!error,  // Set error state if there's an error
                                helperText: error?.message,  // Display error message if available
                            }
                        }}
                    />
                )}
            />
        </LocalizationProvider>
    );
}
