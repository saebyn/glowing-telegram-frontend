import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { Chip } from '@mui/material';
import { FunctionField } from 'react-admin';

interface IngestionStatusFieldProps {
  label?: string;
}

export default function IngestionStatusField({
  label,
}: IngestionStatusFieldProps) {
  return (
    <FunctionField
      label={label}
      sortable={false}
      render={(record) => {
        if (!record) return null;
        const count = record.video_clip_count || 0;

        if (count === 0) {
          return (
            <Chip
              icon={<PendingIcon />}
              label="Not Ingested"
              color="default"
              size="small"
            />
          );
        }
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label={`${count} video${count !== 1 ? 's' : ''}`}
            color="success"
            size="small"
          />
        );
      }}
    />
  );
}
