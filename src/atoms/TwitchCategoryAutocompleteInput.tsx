import TwitchCategoryAutocomplete from '@/atoms/TwitchCategoryAutocomplete';
import type { Profile } from '@/useProfile';
import { type InputProps, useInput } from 'react-admin';

interface TwitchCategoryAutocompleteInputProps extends InputProps {
  profile: Profile;
  label?: string;
}

function TwitchCategoryAutocompleteInput({
  profile,
  label,
  ...props
}: TwitchCategoryAutocompleteInputProps) {
  const { field } = useInput(props);
  return (
    <TwitchCategoryAutocomplete
      category={field.value === '' ? null : field.value}
      onChange={field.onChange}
      profile={profile}
      label={label}
    />
  );
}

export default TwitchCategoryAutocompleteInput;
