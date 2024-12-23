import { getCsrfToken } from '@/utilities/csrf';
import { generateAuthorizeUri } from '@/utilities/twitch';
import CheckIcon from '@mui/icons-material/Check';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { LoadingIndicator, useTranslate, useUpdate } from 'react-admin';

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
  const [update, { isPending, isError }] = useUpdate();

  const csrfToken = getCsrfToken();
  const url = generateAuthorizeUri(csrfToken, scopes);

  const handleDisconnect = () => {
    update('profile', {
      id: 'my-profile',
      data: { twitch: { accessToken: null } },
    });
  };

  const handleConnect = () => {
    window.location.href = url;
  };

  if (isPending) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return (
      <Alert severity="error">
        {translate('gt.profile.errorSaving', {
          _: 'There was an error saving the profile',
        })}
      </Alert>
    );
  }

  // if the user is connected, show the reauthorize button
  return (
    <>
      {tokens.accessToken && (
        <>
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
          <Button
            color="warning"
            variant="contained"
            onClick={handleDisconnect}
          >
            {translate('gt.profile.disconnectTwitch', {
              _: 'Click to Disconnect Twitch',
            })}
          </Button>
        </>
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
