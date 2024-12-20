import { Datagrid, List, type ListProps, TextField } from 'react-admin';

const VideoClipList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="start_time" />
      <TextField source="stream_id" />
    </Datagrid>
  </List>
);

export default VideoClipList;
