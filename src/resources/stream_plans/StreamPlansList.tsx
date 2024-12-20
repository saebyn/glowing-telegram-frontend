import RecurrenceDayField from '@/components/atoms/RecurrenceDayField';
import { Datagrid, List, TextField } from 'react-admin';
import ListActions from './ListActions';
import streamActionFilters from './filters';

function StreamPlansList() {
  return (
    <List actions={<ListActions view="list" />} filters={streamActionFilters}>
      <Datagrid>
        <TextField source="title" />
        <TextField source="start_time" />
        <RecurrenceDayField source="recurrence.days" />
      </Datagrid>
    </List>
  );
}

export default StreamPlansList;
