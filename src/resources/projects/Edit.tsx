import {
  Edit,
  type EditProps,
  required,
  SimpleForm,
  TextInput,
} from 'react-admin';

const ProjectEdit = (props: EditProps) => (
  <Edit {...props} title="Edit Project">
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <TextInput source="description" multiline rows={3} />
    </SimpleForm>
  </Edit>
);

export default ProjectEdit;
