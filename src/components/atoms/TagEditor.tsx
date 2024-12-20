import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslate } from 'react-admin';

interface TagEditorRawProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

function TagEditor({ value, onChange, label }: TagEditorRawProps) {
  const translate = useTranslate();
  const [newTag, setNewTag] = React.useState('');

  const handleDelete = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  // convert tags to a set to remove duplicates, then back to an array and sort
  const tags = Array.from(new Set(value)).sort();

  const handleAdd = () => {
    if (newTag.trim() === '') {
      return;
    }

    onChange([...tags, newTag]);
    setNewTag('');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Box>
        <TextField
          fullWidth={false}
          label={translate('gt.tags.add', { _: 'Add tag' })}
          value={newTag}
          onChange={(event) => setNewTag(event.target.value)}
          inputProps={{
            maxLength: 25,
            onKeyDown: (event) => {
              if (
                event.key === 'Enter' ||
                event.key === ' ' ||
                event.key === ',' ||
                event.key === 'Tab'
              ) {
                event.preventDefault();
                handleAdd();
              }
            },
          }}
        />
        <Button color="primary" onClick={handleAdd}>
          {translate('gt.profile.tags.add', { _: 'Add' })}
        </Button>
      </Box>
      <Box>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => handleDelete(tag)}
            deleteIcon={<DeleteIcon />}
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
}

export default TagEditor;
