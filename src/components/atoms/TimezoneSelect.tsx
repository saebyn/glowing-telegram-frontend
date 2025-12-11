import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import type { RawTimeZone } from '@vvo/tzdb';
import { useEffect, useState } from 'react';

interface TimezoneSelectProps {
  label?: string;
  value: string;
  onChange: (timezone: string) => void;
}

type TimeZoneWithFormat = RawTimeZone & { currentTimeFormat: string };

function TimezoneSelect({ value, onChange, label }: TimezoneSelectProps) {
  const [timeZones, setTimeZones] = useState<TimeZoneWithFormat[]>([]);
  const [defaultTimezone, setDefaultTimezone] =
    useState<TimeZoneWithFormat | null>(null);

  useEffect(() => {
    fetchAndValidateTimezones(value).then(({ timeZones, defaultTimezone }) => {
      setTimeZones(timeZones);
      setDefaultTimezone(defaultTimezone);
    });
  }, [value]);

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

async function fetchAndValidateTimezones(value: string | undefined): Promise<{
  timeZones: TimeZoneWithFormat[];
  defaultTimezone: TimeZoneWithFormat | null;
}> {
  const { getTimeZones } = await import('@vvo/tzdb');
  const { SystemZone } = await import('luxon');

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
