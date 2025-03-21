import RecurrenceDayField from '@/components/atoms/RecurrenceDayField';
import { BooleanField, Datagrid, List, TextField } from 'react-admin';
import ListActions from './ListActions';
import streamActionFilters from './filters';

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
