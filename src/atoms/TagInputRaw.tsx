import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslate } from 'react-admin';

interface TagInputRawProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

function TagInputRaw({ value, onChange, label }: TagInputRawProps) {
  const translate = useTranslate();

  const handleDelete = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  // convert tags to a set to remove duplicates, then back to an array and sort
  const tags = Array.from(new Set(value)).sort();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <TextField
        label={translate('gt.tags.add', { _: 'Add tag' })}
        inputProps={{
          onKeyPress: (e) => {
            if (e.key === 'Enter') {
              const newTag = e.currentTarget.value.trim();
              if (newTag !== '') {
                onChange([...tags, newTag]);
                e.currentTarget.value = '';
              }
            }
          },
        }}
      />
      <Stack direction="row" spacing={1}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => handleDelete(tag)}
            deleteIcon={<DeleteIcon />}
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  );
}

export default TagInputRaw;
