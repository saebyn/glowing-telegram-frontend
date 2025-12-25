import {
  BooleanField,
  CreateButton,
  Datagrid,
  DateField,
  FilterButton,
  List,
  type ListActionsProps,
  type ListProps,
  NullableBooleanInput,
  SearchInput,
  SelectInput,
  TextField,
  TopToolbar,
} from 'react-admin';
import { widgetRegistry } from '@/widgets';

const ListActions = (props: ListActionsProps) => (
  <TopToolbar {...props}>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

const widgetFilters = [
  <SearchInput source="title" alwaysOn key="title" />,
  <SelectInput
    source="type"
    choices={widgetRegistry.getChoices()}
    key="type"
  />,
  <NullableBooleanInput source="active" key="active" />,
];

const WidgetList = (props: ListProps) => (
  <List {...props} filters={widgetFilters} actions={<ListActions />}>
    <Datagrid rowClick="edit">
      <TextField source="title" />
      <TextField source="type" />
      <BooleanField source="showOnDashboard" />
      <BooleanField source="active" />
      <DateField source="created_at" showTime />
      <DateField source="updated_at" showTime />
    </Datagrid>
  </List>
);

export default WidgetList;
