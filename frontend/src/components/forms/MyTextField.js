import * as React from 'react';
import TextField from '@mui/material/TextField';
import { Controller } from 'react-hook-form';

export default function MyTextField(props) {
  const { label, width,marginBottom,marginTop, placeholder, name, control, hidden = false } = props;

  return (
    <Controller
      name={name}
      control={control}  // control from useForm
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextField
          sx={{ width, marginBottom, marginTop }}
          label={hidden ? '' : label}
          variant="outlined"
          placeholder={hidden ? '' : placeholder}
          value={value}
          onChange={onChange}
          error={!!error}
          helperText={error?.message}
          type={hidden ? 'hidden' : 'text'}
        />
      )}
    />
  );
}
