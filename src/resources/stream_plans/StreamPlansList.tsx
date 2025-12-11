import { BooleanField, Datagrid, List, TextField } from 'react-admin';
import RecurrenceDayField from '@/components/atoms/RecurrenceDayField';
import streamActionFilters from './filters';
import ListActions from './ListActions';

function StreamPlansList() {
  return (
    <List actions={<ListActions view="list" />} filters={streamActionFilters}>
      <Datagrid>
        <TextField source="title" />
        <TextField source="start_time" />
        <BooleanField source="is_active" />
        <RecurrenceDayField source="recurrence.days" sortable={false} />
      </Datagrid>
    </List>
  );
}

export default StreamPlansList;
