import Button from '@mui/material/Button';
import { useTranslate } from 'react-admin';
import { getCsrfToken } from '../csrf';
import { generateAuthorizeUri } from '../twitch';

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
    <Button variant="contained" color="secondary" component="a" href={url}>
      {translate('gt.profile.reauthorizeTwitch', { _: 'Reauthorize Twitch' })}
    </Button>
  );
}

export default TwitchOAuthButton;
