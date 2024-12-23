import Chip from '@mui/material/Chip';
import { useFieldValue, useTranslate } from 'react-admin';

interface RecurrenceDayFieldProps {
  source: string;
  sortable?: boolean;
}

const daysToAbbreviation = {
  monday: 'M',
  tuesday: 'T',
  wednesday: 'W',
  thursday: 'Th',
  friday: 'F',
  saturday: 'S',
  sunday: 'Su',
};

function RecurrenceDayField({ source }: RecurrenceDayFieldProps) {
  const days = useFieldValue({
    source: source,
    defaultValue: [],
  });

  const translate = useTranslate();

  // show as a set of chips with a single letter for each day, e.g. "M T W Th F S Su"
  return (
    <>
      {days.map((day: keyof typeof daysToAbbreviation) => (
        <Chip
          key={day}
          label={daysToAbbreviation[day]}
          title={translate(`days.${day}`, { _: day })}
        />
      ))}
    </>
  );
}

export default RecurrenceDayField;
