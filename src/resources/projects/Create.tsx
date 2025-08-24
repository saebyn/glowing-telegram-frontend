import {
  Create,
  type CreateProps,
  SimpleForm,
  TextInput,
  required,
} from 'react-admin';

const ProjectCreate = (props: CreateProps) => (
  <Create {...props} title="Create a Project">
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <TextInput source="description" multiline rows={3} />
    </SimpleForm>
  </Create>
);

export default ProjectCreate;
