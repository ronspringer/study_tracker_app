import * as React from 'react';  // Importing React library
import TextField from '@mui/material/TextField';  // Importing Material-UI's TextField component
import { Controller } from 'react-hook-form';  // Importing Controller for integrating with React Hook Form

// MyPasswordField functional component
export default function MyPasswordField(props) {
  // Destructure props for easy access to necessary properties
  const { 
    label,  // Label for the password field
    width,  // Width of the TextField
    placeholder,  // Placeholder text for the TextField
    marginBottom,  // Bottom margin for the TextField
    marginTop,  // Top margin for the TextField
    name,  // Name of the field in the form
    control,  // Control object from React Hook Form
    hidden = false,  // Boolean to determine if the field should be hidden
  } = props;

  return (
    <Controller
      name={name}  // Specify the name of the field in the form
      control={control}  // Pass the control object from useForm
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        // Render the TextField component as a controlled component
        <TextField
          sx={{ width, marginBottom, marginTop }}  // Style the TextField with specified width and margins
          label={hidden ? '' : label}  // Conditionally render label based on 'hidden' prop
          variant="outlined"  // Set the variant of the TextField
          placeholder={hidden ? '' : placeholder}  // Conditionally render placeholder text
          value={value}  // Set the current value of the TextField
          onChange={onChange}  // Handler for change events
          error={!!error}  // Set error state if there's an error
          helperText={error?.message}  // Display error message if available
          type={hidden ? 'hidden' : 'password'}  // Set input type to password or hidden based on 'hidden' prop
        />
      )}
    />
  );
}
