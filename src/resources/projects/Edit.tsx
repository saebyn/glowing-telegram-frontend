import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import type { StreamClip } from '@saebyn/glowing-telegram-types';
import {
  ProjectClipPool,
  VideoClip,
} from '@saebyn/glowing-telegram-video-editor';
import {
  Edit,
  type EditProps,
  required,
  SimpleForm,
  TextInput,
  useInput,
} from 'react-admin';

function ProjectClipPoolInput({
  source,
  label,
}: {
  source: string;
  label?: string;
}) {
  const { id, field, fieldState } = useInput({ source });

  const sourceValue: StreamClip[] = field.value || [];
  const clips: VideoClip[] = sourceValue.map((clip) => ({
    start: clip.start_time * 1000, // convert seconds to ms
    end: clip.end_time * 1000, // convert seconds to ms
    title: clip.title,
    id: `${id}-${clip.stream_id}-${clip.start_time}-${clip.end_time}`,
  }));

  return (
    <div>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {label}
      </Typography>
      <ProjectClipPool
        clips={clips}
        keyframes={{}}
        thumbnails={{}}
        titles={{}}
      />
    </div>
  );
}

function ProjectEdit(props: EditProps) {
  return (
    <Edit {...props} title="Edit Project">
      <SimpleForm>
        <Card variant="outlined" sx={{ mb: 2, p: 2, width: '100%' }}>
          <CardHeader title="Project Details" />
          <CardContent>
            <TextInput source="title" validate={required()} />
            <TextInput source="description" multiline rows={3} />
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ mb: 2, p: 2, width: '100%' }}>
          <ProjectClipPoolInput source="cuts" label="Clips in the project" />
        </Card>
      </SimpleForm>
    </Edit>
  );
}

export default ProjectEdit;
