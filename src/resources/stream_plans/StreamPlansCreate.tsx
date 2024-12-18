import { Create, SimpleForm, TextInput, required } from 'react-admin';

function StreamPlansCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="title" validate={required()} />
        <TextInput source="description" />
      </SimpleForm>
    </Create>
  );
}

export default StreamPlansCreate;
