import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useId, useState } from 'react';
import { useI18nProvider } from 'react-admin';
import type { Profile } from '@/hooks/useProfile';
import {
  type ContentClassificationLabel,
  type ContentClassificationLabelDefinition,
  getContentClassificationLabels,
} from '@/utilities/twitch';

interface TwitchCCLSelectProps {
  label: string;
  profile: Profile;
  value: ContentClassificationLabel[];
  onChange: (category: ContentClassificationLabel[] | undefined) => void;
}

/**
 * Select for Twitch content classification labels.
 */
function TwitchCCLSelect({
  label,
  value,
  profile,
  onChange,
}: TwitchCCLSelectProps) {
  const fieldId = useId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [contentClassificationLabels, setContentClassificationLabels] =
    useState<ContentClassificationLabelDefinition[]>([]);

  const { getLocale } = useI18nProvider();

  useEffect(() => {
    const abortController = new AbortController();

    if (!profile.twitch?.accessToken) {
      setError(new Error('Missing Twitch access token'));
      return;
    }

    setLoading(true);

    getContentClassificationLabels(getLocale(), profile.twitch.accessToken, {
      signal: abortController.signal,
    })
      .then((data) => {
        setContentClassificationLabels(data);
      })
      .catch((e) => {
        setContentClassificationLabels([]);
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [profile.twitch?.accessToken, getLocale]);

  return (
    <FormControl error={Boolean(error)}>
      <InputLabel shrink={true} id={fieldId}>
        {label}
      </InputLabel>

      <Select
        labelId={fieldId}
        multiple
        value={value
          .filter((label) => label.is_enabled)
          .map((label) => label.id)}
        onChange={(event) => {
          const labels = event.target.value as string[] | undefined;

          onChange(
            labels?.map((id) => ({
              id,
              is_enabled: true,
            })),
          );
        }}
        disabled={loading}
        displayEmpty
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip
                key={value}
                label={
                  contentClassificationLabels.find(
                    (label) => label.id === value,
                  )?.name
                }
              />
            ))}

            {
              // Show an empty chip if no labels are selected
              selected.length === 0 && <Chip label="None" />
            }
          </Box>
        )}
      >
        {contentClassificationLabels.map((label) => (
          <MenuItem key={label.id} value={label.id}>
            <Stack>
              <Typography variant="body1">{label.name}</Typography>
              {label.description && (
                <Typography variant="caption" color="textSecondary">
                  {label.description}
                </Typography>
              )}
            </Stack>
          </MenuItem>
        ))}
      </Select>

      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
}

export default TwitchCCLSelect;
