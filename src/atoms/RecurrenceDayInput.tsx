import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import { type CommonInputProps, useInput, useTranslate } from 'react-admin';

interface RecurrenceDayInputProps extends CommonInputProps {}

const days = [
  { id: 'sunday', name: 'Sunday', abbreviation: 'Su' },
  { id: 'monday', name: 'Monday', abbreviation: 'M' },
  { id: 'tuesday', name: 'Tuesday', abbreviation: 'T' },
  { id: 'wednesday', name: 'Wednesday', abbreviation: 'W' },
  { id: 'thursday', name: 'Thursday', abbreviation: 'Th' },
  { id: 'friday', name: 'Friday', abbreviation: 'F' },
  { id: 'saturday', name: 'Saturday', abbreviation: 'S' },
];

function RecurrenceDayInput(props: RecurrenceDayInputProps) {
  const { label = 'Days', ...inputProps } = props;

  const { field } = useInput<string[]>(inputProps);

  const translate = useTranslate();

  const handleChange = (event: React.SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    const day = target.value;

    if (target.checked) {
      field.onChange([...field.value, day].filter((d) => d));
    } else {
      field.onChange(
        field.value.filter((d: string) => d !== day).filter((d: string) => d),
      );
    }
  };

  return (
    <FormControl component={'fieldset'}>
      <FormLabel component={'legend'}>{label}</FormLabel>
      <FormGroup row>
        {days.map((day) => (
          <FormControlLabel
            value={translate(`days.${day.id}`, { _: day.name })}
            control={<Checkbox value={day.id} />}
            label={day.abbreviation}
            key={day.id}
            checked={field.value.includes(day.id)}
            onChange={handleChange}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}

export default RecurrenceDayInput;
