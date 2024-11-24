import { Datagrid, List, TextField } from 'react-admin';
import RecurrenceDayField from '../../atoms/RecurrenceDayField';
import ListActions from './ListActions';
import streamActionFilters from './filters';

function StreamPlansList() {
  return (
    <List actions={<ListActions view="list" />} filters={streamActionFilters}>
      <Datagrid>
        <TextField source="name" />
        <TextField source="start_time" />
        <RecurrenceDayField source="recurrence.days" />
      </Datagrid>
    </List>
  );
}

export default StreamPlansList;
