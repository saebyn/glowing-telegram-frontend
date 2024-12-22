import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslate } from 'react-admin';

interface TagEditorRawProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  maxTags?: number;
}

function TagEditor({ value, onChange, label, maxTags }: TagEditorRawProps) {
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

  const maxTagsReached = maxTags !== undefined && tags.length >= maxTags;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      {maxTagsReached ? (
        <Typography color="error">
          {translate('gt.tags.max', {
            _: 'You can only add up to %{smart_count} tags',
            smart_count: maxTags,
          })}
        </Typography>
      ) : null}

      <TextField
        disabled={maxTagsReached}
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
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleAdd}
                onMouseDown={handleAdd}
                aria-label={translate('gt.profile.tags.add', { _: 'Add' })}
                disabled={maxTagsReached}
                edge="end"
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

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
