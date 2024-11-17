import {
  AutocompleteArrayInput,
  type AutocompleteArrayInputProps,
  useInput,
} from 'react-admin';

interface TagInputProps extends AutocompleteArrayInputProps {
  source: string;
}

function TagInput(props: TagInputProps) {
  const { field } = useInput<string[]>({
    source: props.source,
  });

  const tags: string[] = field.value || [];

  return (
    <AutocompleteArrayInput
      source="tags"
      choices={tags}
      onCreate={(filter?: string) => {
        if (!filter) {
          return;
        }

        tags.push(filter);

        return {
          id: filter,
          name: filter,
        };
      }}
    />
  );
}

export default TagInput;
