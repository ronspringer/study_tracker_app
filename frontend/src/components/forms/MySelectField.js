import * as React from 'react';  // Importing React library for building UI components
import TextField from '@mui/material/TextField';  // Importing Material-UI's TextField component for user input
import MenuItem from '@mui/material/MenuItem';  // Importing MenuItem for options in the select dropdown
import { Controller } from 'react-hook-form';  // Importing Controller for integrating with React Hook Form
import FormHelperText from '@mui/material/FormHelperText';  // Importing FormHelperText for displaying helper text or error messages

// MySelectField functional component
export default function MySelectField(props) {
    // Destructuring props for easy access to necessary properties
    const { 
        label,  // The label for the select field
        name,  // The name of the field in the form
        control,  // Control object from useForm for managing form state
        width,  // The width of the TextField
        options,  // Array of options to display in the select dropdown
    } = props;

    return (
        <Controller
            name={name}  // Specify the name of the field in the form
            control={control}  // Pass the control object from useForm for managing state
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                // Render the TextField component as a controlled select component
                <TextField
                    value={value}  // Current value of the select field, controlled by React Hook Form
                    onChange={onChange}  // Update the field value when the user selects an option
                    sx={{ width: { width } }}  // Apply styles: width
                    select  // Specify that this TextField is a select field
                    label={label}  // Set the label for the select field
                    error={!!error}  // Set error state if there's an error
                >
                    {
                        // Map over the options to create MenuItem components for each option
                        options.map((option) => (
                            <MenuItem key={option.id} value={option.id}>  {/* Set key prop for unique identification */}
                                {option.subject_name}  {/* Display the subject name as the option text */}
                            </MenuItem>
                        ))
                    }
                    <FormHelperText sx={{ color: '#d32f2f' }}>  {/* Style the helper text for error messages */}
                        {error?.message}  {/* Display error message if there is one */}
                    </FormHelperText>
                </TextField>
            )}
        />
    );
}
