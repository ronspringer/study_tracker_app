import * as React from 'react';  // Importing React library to create UI components
import TextField from '@mui/material/TextField';  // Importing Material-UI's TextField component for user input
import { Controller } from 'react-hook-form';  // Importing Controller from React Hook Form for form management

// MyTextField functional component
export default function MyTextField(props) {
  // Destructuring props for easy access to necessary properties
  const { 
      label,  // The label for the text field
      width,  // The width of the TextField
      marginBottom,  // Bottom margin for styling
      marginTop,  // Top margin for styling
      placeholder,  // Placeholder text for the input field
      name,  // The name of the field in the form
      control,  // Control object from useForm for managing form state
      hidden = false  // Optional prop to determine if the input should be hidden
  } = props;

  return (
    <Controller
      name={name}  // Specify the name of the field in the form
      control={control}  // Pass the control object from useForm for managing state
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        // Render the TextField component as a controlled input
        <TextField
          sx={{ width, marginBottom, marginTop }}  // Apply styles: width and margins
          label={hidden ? '' : label}  // Set label only if not hidden
          variant="outlined"  // Use outlined variant for the text field
          placeholder={hidden ? '' : placeholder}  // Set placeholder only if not hidden
          value={value}  // Current value of the text field, controlled by React Hook Form
          onChange={onChange}  // Update the field value when the user types
          error={!!error}  // Set error state if there's an error
          helperText={error?.message}  // Display error message if there is one
          type={hidden ? 'hidden' : 'text'}  // Set input type to 'hidden' or 'text' based on hidden prop
        />
      )}
    />
  );
}
