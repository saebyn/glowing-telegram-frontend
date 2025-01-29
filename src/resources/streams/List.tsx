import EditorButton from '@/components/atoms/EditorButton';
import TimelineButton from '@/components/atoms/TimelineButton';
import Badge from '@mui/material/Badge';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateTime } from 'luxon';
import {
  BooleanField,
  Datagrid,
  DateField,
  DateInput,
  EditButton,
  List,
  type ListProps,
  NullableBooleanInput,
  NumberField,
  ReferenceField,
  ReferenceInput,
  SearchInput,
  SelectInput,
  TextField,
  useListContext,
} from 'react-admin';

const streamsFilter = [
  <SearchInput source="title" alwaysOn key="title" />,

  <NullableBooleanInput
    source="has_transcription"
    label="Transcription"
    key="has_transcription"
  />,
  <NullableBooleanInput
    source="has_silence_detection"
    label="Silence Detection"
    key="has_silence_detection"
  />,
  <NullableBooleanInput
    source="has_video_clips"
    label="Video Clips"
    key="has_video_clips"
  />,
  <NullableBooleanInput
    source="has_episodes"
    label="Episodes"
    key="has_episodes"
  />,

  <DateInput
    source="stream_date__gte"
    label="Stream Date After"
    key="stream_date__gte"
  />,

  <ReferenceInput source="series_id" reference="series" key="series_id">
    <SelectInput optionText="title" />
  </ReferenceInput>,
];

function getDateKey(date: DateTime): string {
  return `${date.year}-${(date.month + 1)
    .toString()
    .padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
}

const StreamDay = ({
  days,
  day,

  ...props
}: any) => {
  const dayStr = getDateKey(day);
  const count = days[dayStr] || 0;

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={count}
      variant="dot"
      color="primary"
    >
      <PickersDay {...props} day={day} />
    </Badge>
  );
};

const calendarStyle = {
  display: 'flex',
  minWidth: 300,
  flexDirection: 'column',
  alignItems: 'center',
  '& .MuiPickersCalendar-week': {
    display: 'flex',
    justifyContent: 'center',
  },
  '& .MuiPickersCalendar-transitionContainer': {
    width: '100%',
  },
};

const CalendarView = () => {
  const list = useListContext();

  const days: Record<string, number> = {};

  if (list.data) {
    for (const stream of list.data) {
      if (!stream || !stream.stream_date) {
        return;
      }
      const date = DateTime.fromISO(stream.stream_date);
      const key = getDateKey(date);
      days[key] = (days[key] || 0) + 1;
    }
  }

  return (
    <DateCalendar
      sx={calendarStyle}
      showDaysOutsideCurrentMonth
      slots={{
        day: StreamDay,
      }}
      slotProps={{
        day: {
          days,
        } as any,
      }}
    />
  );
};

const StreamList = (props: ListProps) => (
  <List {...props} filters={streamsFilter} aside={<CalendarView />}>
    <Datagrid rowClick={false}>
      <DateField source="stream_date" />
      <TextField source="title" />
      <ReferenceField source="series_id" reference="series">
        <TextField source="title" />
      </ReferenceField>
      <NumberField source="video_clip_count" />
      <BooleanField source="has_transcription" />
      <BooleanField source="has_silence_detection" />
      <BooleanField source="has_episodes" />

      <TimelineButton />
      <EditButton />
      <EditorButton />
    </Datagrid>
  </List>
);

export default StreamList;
