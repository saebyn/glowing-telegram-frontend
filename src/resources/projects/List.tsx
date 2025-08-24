import {
  CreateButton,
  Datagrid,
  DateField,
  FilterButton,
  List,
  type ListActionsProps,
  type ListProps,
  SearchInput,
  TextField,
  TopToolbar,
} from 'react-admin';

const ListActions = (props: ListActionsProps) => (
  <TopToolbar {...props}>
    <FilterButton />
    <CreateButton />
  </TopToolbar>
);

const projectFilters = [<SearchInput source="title" alwaysOn key="title" />];

const ProjectsList = (props: ListProps) => (
  <List {...props} filters={projectFilters} actions={<ListActions />}>
    <Datagrid rowClick="edit">
      <TextField source="title" />
      <TextField source="description" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </Datagrid>
  </List>
);

export default ProjectsList;
