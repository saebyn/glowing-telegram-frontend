import { useInput } from 'react-admin';
import TagEditor from './TagEditor';

interface TagInputProps {
  source: string;
  label?: string;
}

function TagInput(props: TagInputProps) {
  const { field } = useInput<string[]>({
    source: props.source,
  });

  return (
    <TagEditor
      value={field.value}
      onChange={field.onChange}
      label={props.label}
    />
  );
}

export default TagInput;
