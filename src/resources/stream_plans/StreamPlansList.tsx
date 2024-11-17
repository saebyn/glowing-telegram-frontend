import { ChipField, Datagrid, List, TextField } from 'react-admin';

function StreamPlansList() {
  return (
    <List>
      <Datagrid>
        <TextField source="name" />
        <TextField source="start_time" />
        <ChipField source="recurrence.days" />
      </Datagrid>
    </List>
  );
}

export default StreamPlansList;
