import Badge from '@mui/material/Badge';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateTime } from 'luxon';
import { useState } from 'react';
import {
  BooleanField,
  Datagrid,
  DateField,
  DateInput,
  EditButton,
  List,
  type ListProps,
  NullableBooleanInput,
  type RaRecord,
  ReferenceField,
  ReferenceInput,
  SearchInput,
  SelectInput,
  TextField,
  useListContext,
} from 'react-admin';
import EditorButton from '@/components/atoms/EditorButton';

const streamsFilter = [
  <SearchInput source="title" alwaysOn key="title" />,

  <NullableBooleanInput
    source="has_episodes"
    label="Episodes"
    key="has_episodes"
  />,

  <DateInput
    source="stream_date__lte"
    parse={(value) => {
      if (value) {
        const date = DateTime.fromISO(value).endOf('day').toUTC();
        return date.toISO();
      }
    }}
    label="Until"
    key="stream_date__lte"
  />,

  <DateInput
    source="stream_date__gte"
    parse={(value) => {
      if (value) {
        const date = DateTime.fromISO(value).startOf('day').toUTC();
        return date.toISO();
      }
    }}
    label="From"
    key="stream_date__gte"
  />,

  <ReferenceInput source="series_id" reference="series" key="series_id">
    <SelectInput optionText="title" />
  </ReferenceInput>,
];

function getDateKey(date: DateTime): string {
  return `${date.year}-${date.month
    .toString()
    .padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
}

type StreamDayProps = {
  days: Record<string, number>;
  day: DateTime;

  onDayHighlight: (date: DateTime | null) => void;
} & React.ComponentProps<typeof PickersDay>;

const StreamDay = ({
  days,
  day,

  onDayHighlight,

  ...props
}: StreamDayProps) => {
  const dayStr = getDateKey(day);
  const count = days[dayStr] || 0;

  const handleMouseEnter = () => {
    onDayHighlight(day);
  };

  const handleMouseLeave = () => {
    onDayHighlight(null);
  };

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={count}
      variant="dot"
      color="primary"
    >
      <PickersDay
        {...props}
        day={day}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
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

interface CalendarViewProps {
  setHighlightedDate: (date: string | null) => void;
}

const CalendarView = ({ setHighlightedDate }: CalendarViewProps) => {
  const list = useListContext();

  const handleDaySelect = (date: DateTime) => {
    list.setFilters({
      ...list.filterValues,
      stream_date__gte: date.startOf('day').toUTC().toISO(),
      stream_date__lte: date.endOf('day').toUTC().toISO(),
    });
  };

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
      slots={
        {
          day: StreamDay,
        } as any
      }
      slotProps={{
        day: {
          days,
          onDaySelect: handleDaySelect,
          onDayHighlight: (date: DateTime | null) => {
            const key = date ? getDateKey(date) : null;
            setHighlightedDate(key);
          },
        } as any,
      }}
    />
  );
};

function StreamList(props: ListProps) {
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);

  const rowSx = (record: RaRecord) => {
    const date = DateTime.fromISO(record.stream_date);
    const key = getDateKey(date);

    const highlighted = highlightedDate && key.startsWith(highlightedDate);

    if (highlighted) {
      return { backgroundColor: 'rgba(255, 235, 59, 0.3)' };
    }

    return {};
  };

  return (
    <List
      {...props}
      filters={streamsFilter}
      aside={<CalendarView setHighlightedDate={setHighlightedDate} />}
    >
      <Datagrid rowClick={false} rowSx={rowSx}>
        <DateField source="stream_date" />
        <TextField source="title" />
        <ReferenceField source="series_id" reference="series">
          <TextField source="title" />
        </ReferenceField>
        <BooleanField source="has_episodes" />

        <EditorButton />
        <EditButton />
      </Datagrid>
    </List>
  );
}

export default StreamList;
