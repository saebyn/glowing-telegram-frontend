import {
  CreateButton,
  Datagrid,
  List,
  ListButton,
  TextField,
  TopToolbar,
} from 'react-admin';
import RecurrenceDayField from '../../atoms/RecurrenceDayField';

const ListActions = () => (
  <TopToolbar>
    <CreateButton />

    <ListButton />
  </TopToolbar>
);

function StreamPlansCalendar() {
  return (
    <List actions={<ListActions />}>
      <Datagrid>
        <TextField source="name" />
        <TextField source="start_time" />
        <RecurrenceDayField source="recurrence.days" />
      </Datagrid>
    </List>
  );
}

export default StreamPlansCalendar;
