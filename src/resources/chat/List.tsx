import { DateTime } from 'luxon';
import {
  DateField,
  DateInput,
  InfiniteList,
  SimpleList,
  TextInput,
} from 'react-admin';

const chatFilters = [
  <TextInput source="user_name" />,

  <DateInput
    source="timestamp__lte"
    parse={(value) => {
      if (value) {
        const date = DateTime.fromISO(value).endOf('day').toUTC();
        return date.toISO();
      }
    }}
    label="Until"
    key="timestamp__lte"
  />,

  <DateInput
    source="timestamp__gte"
    parse={(value) => {
      if (value) {
        const date = DateTime.fromISO(value).startOf('day').toUTC();
        return date.toISO();
      }
    }}
    label="From"
    key="timestamp__gte"
  />,
];

const ChatList = () => (
  <InfiniteList filters={chatFilters}>
    <SimpleList
      primaryText={(record) => record.message}
      secondaryText={(record) => record.user_name}
      tertiaryText={() => <DateField source="timestamp" showTime={true} />}
    />
  </InfiniteList>
);

export default ChatList;
