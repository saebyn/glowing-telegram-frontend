import {
  AutocompleteInput,
  Datagrid,
  List,
  type ListProps,
  ReferenceInput,
  TextField,
  useRecordContext,
} from 'react-admin';

const videoClipsFilter = [
  <ReferenceInput source="stream_id" reference="streams" key="stream_id">
    <AutocompleteInput optionText="title" />
  </ReferenceInput>,
];

const VideoClipDetails = () => {
  const record = useRecordContext();
  return <pre>{JSON.stringify(record, null, 2)}</pre>;
};

const VideoClipList = (props: ListProps) => (
  <List {...props} filters={videoClipsFilter}>
    <Datagrid rowClick="edit" expand={<VideoClipDetails />}>
      <TextField source="id" />
      <TextField source="start_time" />
      <TextField source="stream_id" />
    </Datagrid>
  </List>
);

export default VideoClipList;
