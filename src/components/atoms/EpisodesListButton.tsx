import { Button, Link, useRecordContext, useTranslate } from 'react-admin';

const EpisodesListButton = () => {
  const translate = useTranslate();
  const record = useRecordContext();
  const filter = { stream_id: record?.id };

  return (
    <Button
      component={Link}
      to={{
        pathname: '/episodes',
        search: `filter=${JSON.stringify(filter)}`,
      }}
      label={translate('gt.streams.episodes_button', {
        _: 'View Episodes',
      })}
    />
  );
};

export default EpisodesListButton;
