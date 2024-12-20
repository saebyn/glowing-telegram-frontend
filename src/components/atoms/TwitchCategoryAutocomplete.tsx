import type { Profile } from '@/hooks/useProfile';
import { type TwitchCategory, searchCategories } from '@/twitch';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { debounce } from '@mui/material/utils';
import { useEffect, useMemo, useState } from 'react';

const FETCH_CATEGORIES_DEBOUNCE_TIME = 300;

interface TwitchCategoryAutocompleteProps {
  label: string;
  profile: Profile;
  category: TwitchCategory | null;
  onChange: (category: TwitchCategory | null) => void;
}

/**
 * Autocomplete for Twitch categories.
 */
function TwitchCategoryAutocomplete({
  label,
  category,
  profile,
  onChange,
}: TwitchCategoryAutocompleteProps) {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<TwitchCategory[]>([]);

  const fetchCategories = useMemo(
    () =>
      debounce(async (search: string) => {
        if (search === '') {
          setCategories([]);
          return;
        }

        const abortController = new AbortController();

        setLoading(true);
        setError(null);

        try {
          const data = await searchCategories(
            search,
            profile.twitch.accessToken,

            {
              signal: abortController.signal,
            },
          );

          setCategories(data);
        } catch (error) {
          setError(error as Error);
        } finally {
          setLoading(false);
        }
      }, FETCH_CATEGORIES_DEBOUNCE_TIME),
    [profile.twitch.accessToken],
  );

  useEffect(() => {
    fetchCategories(searchText);
  }, [searchText, fetchCategories]);

  return (
    <>
      {error && (
        <Box>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      )}
      <Autocomplete
        options={categories.concat(
          category && !categories.find((c) => c.id === category.id)
            ? [category]
            : [],
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        // disable the default filtering behavior since we will do filtering on the backend
        filterOptions={(x) => x}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => <TextField {...params} label={label} />}
        autoComplete
        value={category}
        loading={loading}
        onInputChange={(_, newInputValue) => {
          setSearchText(newInputValue);
        }}
        onChange={(_, newValue) => {
          onChange(newValue);
        }}
        renderOption={({ key, ...props }, option) => {
          return (
            <li {...props} key={key}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  {option.box_art_url && (
                    <img
                      src={option.box_art_url}
                      alt="Box art"
                      width={50}
                      height={50}
                    />
                  )}
                </Grid>
                <Grid item>{option.name}</Grid>
              </Grid>
            </li>
          );
        }}
      />
    </>
  );
}

export default TwitchCategoryAutocomplete;
