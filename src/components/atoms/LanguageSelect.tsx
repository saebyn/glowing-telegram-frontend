import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ISO6391 from 'iso-639-1';
import { useMemo } from 'react';
import { useI18nProvider } from 'react-admin';

interface LanguageSelectProps {
  onChange: (language: string) => void;
  value: string;
}

function LanguageSelect({ onChange, value }: LanguageSelectProps) {
  const i18nProvider = useI18nProvider();
  const languages = useMemo(() => {
    return ISO6391.getAllCodes().map((code) => ({
      code,
      name: new Intl.DisplayNames([i18nProvider.getLocale()], {
        type: 'language',
      }).of(code),
    }));
  }, [i18nProvider]);

  return (
    <FormControl>
      <InputLabel>Language</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
      >
        {languages.map((language) => (
          <MenuItem key={language.code} value={language.code}>
            {language.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default LanguageSelect;
