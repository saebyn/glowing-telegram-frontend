import Autocomplete from '@mui/material/Autocomplete';
import { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { getTimeZones } from '@vvo/tzdb';
import { SystemZone } from 'luxon';

interface TimezoneSelectProps {
  label?: string;
  value: string;
  onChange: (timezone: string) => void;
}

function TimezoneSelect({ value, onChange, label }: TimezoneSelectProps) {
  const { timeZones, defaultTimezone } = fetchAndValidateTimezones(value);

  const filterOptions = createFilterOptions<(typeof timeZones)[0]>({
    stringify: (option) =>
      `${option.name} ${option.alternativeName} ${option.group.join(' ')} ${option.abbreviation}`,
  });

  return (
    <Autocomplete
      options={timeZones}
      getOptionLabel={(option) =>
        `${option.currentTimeFormat} (${option.abbreviation})`
      }
      value={defaultTimezone}
      onChange={(_, newValue) => {
        if (newValue) {
          onChange(newValue.name);
        }
      }}
      filterOptions={filterOptions}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}

export default TimezoneSelect;

function fetchAndValidateTimezones(value: string | undefined) {
  const currentZoneName = value || SystemZone.instance.name;
  const timeZones = [];
  let defaultTimezone = null;
  for (const tz of getTimeZones()) {
    if (currentZoneName === tz.name || tz.group.includes(currentZoneName)) {
      defaultTimezone = tz;
    }

    timeZones.push({
      ...tz,
    });
  }

  return {
    timeZones,
    defaultTimezone,
  };
}
