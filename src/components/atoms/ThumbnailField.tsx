import { FunctionField } from 'react-admin';

interface ThumbnailFieldProps {
  width?: number;
  height?: number;
  source: string;
  label?: string;
  altField?: string;
}

const ThumbnailField = ({
  width,
  height,
  source,
  label,
  altField = 'title',
}: ThumbnailFieldProps) => {
  const widthValue = width || 100;
  const heightValue = height || 100;

  return (
    <FunctionField
      label={label}
      sortable={false}
      render={(record) => {
        if (!record[source]) {
          return null;
        }

        const thumbnailUrl = record[source]
          .replace('%{width}', widthValue)
          .replace('%{height}', heightValue);
        return (
          <img
            src={thumbnailUrl}
            alt={record[altField] || ''}
            width={widthValue}
            height={heightValue}
          />
        );
      }}
    />
  );
};

export default ThumbnailField;
