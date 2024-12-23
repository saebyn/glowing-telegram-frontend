/**
 * TitleInput component
 *
 * This component is used to input the title of a record,
 * and is used in the Edit and Create views. It extends the
 * TextInput component from react-admin.
 */
import { TextInput, maxLength, minLength, required } from 'react-admin';

// Derive the Props type from the TextInput component
type Props = React.ComponentProps<typeof TextInput>;

const inputProps = {
  placeholder: 'Enter the title here',
};

const muiInputProps = {};

const titleValidators = [required(), minLength(1), maxLength(100)];

const TitleInput = (props: Props) => (
  <TextInput
    {...props}
    label="Title"
    inputProps={inputProps}
    InputProps={muiInputProps}
    fullWidth
    validate={titleValidators}
    resettable
  />
);

export default TitleInput;
