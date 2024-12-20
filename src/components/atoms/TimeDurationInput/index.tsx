import type { TextFieldProps } from '@mui/material/TextField';
import { type CommonInputProps, useInput } from 'react-admin';
import TimeDurationInputBase from './TimeDurationInputBase';

export type TimeDurationInputProps = CommonInputProps &
  Omit<TextFieldProps, 'helperText' | 'label'>;

export const TimeDurationInput = (props: TimeDurationInputProps) => {
  const { onChange, onBlur, label, ...rest } = props;
  const {
    field,
    fieldState: { isTouched, invalid, error },
    formState: { isSubmitted },
    isRequired,
  } = useInput({
    onChange,
    onBlur,
    ...rest,
  });

  return (
    <TimeDurationInputBase
      onChange={field.onChange}
      onBlur={field.onBlur}
      value={field.value}
      name={field.name}
      disabled={field.disabled}
      label={label}
      error={(isTouched || isSubmitted) && invalid}
      helperText={(isTouched || isSubmitted) && invalid ? error?.message : ''}
      required={isRequired}
      {...rest}
    />
  );
};
