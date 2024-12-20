import { Create, type CreateProps, SimpleForm, TextInput } from 'react-admin';

const VideoClipCreate = (props: CreateProps) => (
  <Create {...props} title="Create a Video Clip">
    <SimpleForm>
      <TextInput source="title" required />
    </SimpleForm>
  </Create>
);

export default VideoClipCreate;
