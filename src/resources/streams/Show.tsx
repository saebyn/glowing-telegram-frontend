import ThumbnailField from '@/components/atoms/ThumbnailField';
import {
  Button,
  Datagrid,
  DateField,
  Identifier,
  Link,
  NumberField,
  ReferenceArrayField,
  ReferenceManyField,
  Show,
  type ShowProps,
  SimpleShowLayout,
  TextField,
  useRecordContext,
  useTranslate,
} from 'react-admin';

const EpisodesButton = () => {
  const translate = useTranslate();
  const record = useRecordContext();
  const filter = { stream_id: record?.id };

  return (
    <Button
      component={Link}
      to={{
        pathname: '/episodes',
        search: `filter=${JSON.stringify(filter)}`,
      }}
      label={translate('gt.streams.episodes_button', {
        _: 'View Episodes',
      })}
    />
  );
};

const StreamShow = (props: ShowProps) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="title" />
      <ThumbnailField source="thumbnail" width={100} height={100} />

      <TextField source="description" />
      <TextField source="id" />
      <DateField source="prefix" />

      <ReferenceManyField reference="video_clips" target="stream_id">
        <Datagrid>
          <TextField source="key" />
          <NumberField source="start_time" />
          <TextField source="summary.title" label="Title" />
        </Datagrid>
      </ReferenceManyField>

      <EpisodesButton />

      <DateField source="created_at" />
      <TextField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default StreamShow;
