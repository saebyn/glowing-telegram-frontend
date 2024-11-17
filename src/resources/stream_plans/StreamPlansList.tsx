import { Datagrid, List, TextField } from 'react-admin';
import RecurrenceDayField from '../../atoms/RecurrenceDayField';

function StreamPlansList() {
  return (
    <List>
      <Datagrid>
        <TextField source="name" />
        <TextField source="start_time" />
        <RecurrenceDayField source="recurrence.days" />
      </Datagrid>
    </List>
  );
}

export default StreamPlansList;
