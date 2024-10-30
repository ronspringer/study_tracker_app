import * as React from 'react';  // Importing React library
import TextField from '@mui/material/TextField';  // Importing Material-UI's TextField component
import { Controller } from 'react-hook-form';  // Importing Controller for integrating with React Hook Form

// MyMultiLineField functional component
export default function MyMultiLineField(props) {
    // Destructure props for easy access to necessary properties
    const { label, placeholder, width, name, control } = props;

    return (
        <Controller
            name={name}  // Name of the field in the form
            control={control}  // Control object from React Hook Form
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                // Render the TextField component as a controlled component
                <TextField
                    sx={{ width: { width } }}  // Style the TextField with the specified width
                    label={label}  // Label for the TextField
                    multiline  // Enable multiline input
                    maxRows={4}  // Maximum number of rows for the TextField
                    placeholder={placeholder}  // Placeholder text for the TextField
                    value={value}  // Current value of the TextField
                    onChange={onChange}  // Handler for change events
                    error={!!error}  // Set error state if there's an error
                    helperText={error?.message}  // Display error message if available
                />
            )}
        />
    );
}
