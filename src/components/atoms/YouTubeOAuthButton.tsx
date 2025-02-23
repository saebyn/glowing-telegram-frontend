import CheckIcon from '@mui/icons-material/Check';
import Button from '@mui/material/Button';
import { useDataProvider, useTranslate } from 'react-admin';

interface YouTubeOAuthButtonProps {
  tokens: {
    accessToken?: string;
  };
}

const scopes: string[] = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
];

function YouTubeOAuthButton({ tokens }: YouTubeOAuthButtonProps) {
  const translate = useTranslate();
  const dataprovider = useDataProvider();

  const handleConnect = async () => {
    const url = await dataprovider.generateAuthorizeUri('youtube', scopes);
    window.location.href = url;
  };

  return (
    <>
      {tokens.accessToken && (
        <Button
          variant="contained"
          color="success"
          title={translate('gt.profile.reauthorizeYouTube', {
            _: 'Click to Re-authorize YouTube',
          })}
          onClick={handleConnect}
        >
          <CheckIcon />{' '}
          {translate('gt.profile.connectedToYouTube', {
            _: 'Connected to YouTube',
          })}
        </Button>
      )}

      {!tokens.accessToken && (
        <Button color="primary" variant="contained" onClick={handleConnect}>
          {translate('gt.profile.connectYouTube', { _: 'Connect to YouTube' })}
        </Button>
      )}
    </>
  );
}

export default YouTubeOAuthButton;
