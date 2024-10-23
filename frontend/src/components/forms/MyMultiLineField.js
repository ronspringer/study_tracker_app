import * as React from 'react';
import TextField from '@mui/material/TextField';
import {Controller} from 'react-hook-form';

export default function MyMultiLineField(props) {
    const {label, placeholder, width, name, control} = props
  return (
    <Controller
    name = {name}
    control = {control}
    render = {({
        field:{onChange, value},
        fieldState:{error},
        formState,
    }) => (
        <TextField
        id="outlined-multiline-flexible"
        sx={{width:{width}}}
        label={label}
        multiline
        maxRows={4}
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        error={!!error}
        helperText={error?.message}
      />
    )
    }
    />
  );
}