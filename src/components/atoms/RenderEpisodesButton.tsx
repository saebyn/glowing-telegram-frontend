import {
  Button,
  LoadingIndicator,
  useListContext,
  useTranslate,
  useUpdateMany,
} from 'react-admin';

const RenderEpisodesButton = () => {
  const { selectedIds } = useListContext();
  const translate = useTranslate();
  const [updateMany, { isPending, isLoading, error, isSuccess }] =
    useUpdateMany('render', {
      ids: selectedIds,
      data: {},
    });

  if (isPending || isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <div>
        <h1>{translate('gt.profile.error', { _: 'Error' })}</h1>
        <p>
          {translate('gt.profile.errorSaving', {
            _: 'There was an error saving the profile',
          })}
        </p>
        <p>{error.toString()}</p>
      </div>
    );
  }

  return (
    <Button
      label="Render"
      onClick={() => updateMany()}
      color={getStatusColor({
        isSuccess,
        isPending,
        isLoading,
        error,
      })}
    />
  );
};

function getStatusColor({
  isSuccess,
  isPending,
  isLoading,
  error,
}: {
  isSuccess: boolean;
  isPending: boolean;
  isLoading: boolean;
  error: unknown;
}): 'primary' | 'success' | 'error' | 'secondary' | 'info' {
  if (isSuccess) {
    return 'success';
  }
  if (isPending || isLoading) {
    return 'info';
  }
  if (error) {
    return 'error';
  }
  return 'primary';
}

export default RenderEpisodesButton;
