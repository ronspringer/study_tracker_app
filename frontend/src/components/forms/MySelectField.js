import * as React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import {Controller} from 'react-hook-form';
import FormHelperText from '@mui/material/FormHelperText';


export default function MySelectField(props) {

    const {label, name, control, width, options} = props  

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
            id="outlined-select-field"
            value={value}
            onChange={onChange}
            sx={{width:{width}}}
            select
            label={label}
            // helperText= 'Please select name of subject'
            error={!!error}
          >
            {
              options.map((option) => (
                <MenuItem value={option.id}>{option.subject_name}</MenuItem>
              ))
            }         
          <FormHelperText sx={{color:'#d32f2f'}}>
            {error?.message}
          </FormHelperText>
          </TextField>
        )
        }
        />
  );
}
