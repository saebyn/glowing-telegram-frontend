import CheckIcon from '@mui/icons-material/Check';
import Button from '@mui/material/Button';
import { useDataProvider, useTranslate } from 'react-admin';

interface TwitchOAuthButtonProps {
  tokens: {
    accessToken?: string;
  };
}

const scopes = [
  'channel:manage:broadcast',
  'channel:edit:commercial',
  'channel:read:ads',
];

function TwitchOAuthButton({ tokens }: TwitchOAuthButtonProps) {
  const translate = useTranslate();
  const dataprovider = useDataProvider();

  const handleConnect = async () => {
    const url = await dataprovider.generateAuthorizeUri('twitch', scopes);
    window.location.href = url;
  };

  return (
    <>
      {tokens.accessToken && (
        <Button
          variant="contained"
          color="success"
          title={translate('gt.profile.reauthorizeTwitch', {
            _: 'Click to Re-authorize Twitch',
          })}
          onClick={handleConnect}
        >
          <CheckIcon />{' '}
          {translate('gt.profile.connectedToTwitch', {
            _: 'Connected to Twitch',
          })}
        </Button>
      )}

      {!tokens.accessToken && (
        <Button color="primary" variant="contained" onClick={handleConnect}>
          {translate('gt.profile.connectTwitch', { _: 'Connect to Twitch' })}
        </Button>
      )}
    </>
  );
}

export default TwitchOAuthButton;
