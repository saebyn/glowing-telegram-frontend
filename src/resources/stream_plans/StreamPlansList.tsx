import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  Button,
  CreateButton,
  Datagrid,
  Link,
  List,
  TextField,
  TopToolbar,
} from 'react-admin';
import RecurrenceDayField from '../../atoms/RecurrenceDayField';

const ListActions = () => {
  return (
    <TopToolbar>
      <CreateButton />

      <Button component={Link} to="calendar" label="Calendar">
        <CalendarMonthIcon />
      </Button>
    </TopToolbar>
  );
};

function StreamPlansList() {
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

export default StreamPlansList;
