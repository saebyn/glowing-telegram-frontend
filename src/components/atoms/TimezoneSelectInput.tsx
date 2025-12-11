import { type InputProps, useInput } from 'react-admin';
import TimezoneSelect from '@/components/atoms/TimezoneSelect';

type TimezoneSelectInputProps = InputProps<string> & {
  label?: string;
};

function TimezoneSelectInput({ label, ...props }: TimezoneSelectInputProps) {
  const { field } = useInput<string>({
    ...props,
  });

  return (
    <TimezoneSelect
      value={field.value}
      onChange={field.onChange}
      label={label}
    />
  );
}

export default TimezoneSelectInput;
