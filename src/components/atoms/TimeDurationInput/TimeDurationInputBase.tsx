import {
  Box,
  FormControl,
  FormHelperText,
  Input,
  InputAdornment,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import { Duration } from 'luxon';
import type React from 'react';

export type TimeDurationInputBaseProps = TextFieldProps & {
  format: 'iso8601' | 'seconds';
};

function parseValue(
  value: string,
  format: TimeDurationInputBaseProps['format'],
): Duration {
  if (format === 'iso8601') {
    return Duration.fromISO(value).shiftTo(
      'hours',
      'minutes',
      'seconds',
      'milliseconds',
    );
  }

  return Duration.fromObject({
    seconds: value ? Number.parseInt(value as string, 10) || 0 : 0,
  }).shiftTo('hours', 'minutes', 'seconds', 'milliseconds');
}

function formatValue(
  value: number,
  format: TimeDurationInputBaseProps['format'],
) {
  if (format === 'iso8601') {
    return Duration.fromObject({ seconds: value })
      .shiftTo('hours', 'minutes', 'seconds', 'milliseconds')
      .toISO();
  }

  return value.toString();
}

const TimeDurationInputBase = (props: TimeDurationInputBaseProps) => {
  const { value, name, error, helperText, onChange, format } = props;

  const duration = parseValue(value as string, format);
  const hours = duration.hours;
  const minutes = duration.minutes;
  const seconds = Math.floor(duration.seconds);
  const milliseconds = duration.milliseconds;

  const handleChange =
    (part: 'hours' | 'minutes' | 'seconds' | 'milliseconds') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = Number.parseInt(event.target.value, 10);
      const newDuration = Duration.fromObject({
        hours,
        minutes,
        seconds,
        milliseconds,
        [part]: numericValue,
      });
      const updatedSeconds = newDuration.as('seconds');

      if (onChange) {
        onChange({
          ...event,
          target: {
            ...event.target,
            value: formatValue(updatedSeconds, format),
            name: name || '',
          },
        });
      }
    };

  const commonProps = {
    error,
    required: props.required,
    variant: 'outlined',
    type: 'number',
    sx: {
      '& input': {
        textAlign: 'right',
      },
    },
  } as const;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <FormHelperText id={`${name}-helper-text`} error={error}>
        {helperText}
      </FormHelperText>

      <FormControl variant="standard">
        <Input
          name={`${name}.hours`}
          onChange={handleChange('hours')}
          endAdornment={<InputAdornment position="end">h</InputAdornment>}
          aria-describedby={`${name}-hours-helper-text`}
          value={hours}
          {...commonProps}
          inputProps={{
            'aria-label': 'hours',
          }}
        />
        <FormHelperText id={`${name}-hours-helper-text`}>Hours</FormHelperText>
      </FormControl>
      <FormControl variant="standard">
        <Input
          name={`${name}.minutes`}
          onChange={handleChange('minutes')}
          endAdornment={<InputAdornment position="end">m</InputAdornment>}
          aria-describedby={`${name}-minutes-helper-text`}
          value={minutes}
          {...commonProps}
          inputProps={{
            'aria-label': 'minutes',
          }}
        />
        <FormHelperText id={`${name}-minutes-helper-text`}>
          Minutes
        </FormHelperText>
      </FormControl>
      <FormControl variant="standard">
        <Input
          name={`${name}.seconds`}
          onChange={handleChange('seconds')}
          endAdornment={<InputAdornment position="end">s</InputAdornment>}
          aria-describedby={`${name}-seconds-helper-text`}
          value={seconds}
          {...commonProps}
          inputProps={{
            'aria-label': 'seconds',
          }}
        />
        <FormHelperText id={`${name}-seconds-helper-text`}>
          Seconds
        </FormHelperText>
      </FormControl>
      <FormControl variant="standard">
        <Input
          name={`${name}.milliseconds`}
          onChange={handleChange('milliseconds')}
          endAdornment={<InputAdornment position="end">ms</InputAdornment>}
          aria-describedby={`${name}-milliseconds-helper-text`}
          value={milliseconds}
          {...commonProps}
          inputProps={{
            'aria-label': 'milliseconds',
          }}
        />
        <FormHelperText id={`${name}-milliseconds-helper-text`}>
          Milliseconds
        </FormHelperText>
      </FormControl>
    </Box>
  );
};

export default TimeDurationInputBase;
