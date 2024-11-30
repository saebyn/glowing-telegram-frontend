import { getCsrfToken } from '@/csrf';
import { generateAuthorizeUri } from '@/twitch';
import CheckIcon from '@mui/icons-material/Check';
import Button from '@mui/material/Button';
import { useTranslate } from 'react-admin';

interface TwitchOAuthButtonProps {
  tokens: {
    accessToken?: string;
  };
}

const scopes = ['channel:manage:broadcast'];

function TwitchOAuthButton({ tokens }: TwitchOAuthButtonProps) {
  const translate = useTranslate();
  const csrfToken = getCsrfToken();
  const url = generateAuthorizeUri(csrfToken, scopes);

  // if the user is not connected, show the connect button
  if (!tokens?.accessToken) {
    return (
      <Button variant="contained" color="primary" component="a" href={url}>
        {translate('gt.profile.connectTwitch', { _: 'Connect to Twitch' })}
      </Button>
    );
  }

  // if the user is connected, show the reauthorize button
  return (
    <Button
      variant="contained"
      color="success"
      component="a"
      href={url}
      title={translate('gt.profile.reauthorizeTwitch', {
        _: 'Click to Re-authorize Twitch',
      })}
    >
      <CheckIcon />{' '}
      {translate('gt.profile.connectedToTwitch', { _: 'Connected to Twitch' })}
    </Button>
  );
}

export default TwitchOAuthButton;
