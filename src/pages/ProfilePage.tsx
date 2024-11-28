import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  LoadingIndicator,
  useGetIdentity,
  useGetOne,
  useTranslate,
} from 'react-admin';
import TagInputRaw from '../atoms/TagInputRaw';
import TimezoneSelect from '../atoms/TimezoneSelect';
import TwitchOAuthButton from '../atoms/TwitchOAuthButton';
import gravatar from '../gravitar';

const ProfilePage = () => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();

  if (!identity) {
    return null;
  }

  const {
    data: profile,
    isPending,
    error,
  } = useGetOne('profile', { id: 'my-profile' });

  if (isPending) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const avatarUrl = gravatar(identity.email, identity.fullName);

  return (
    <Box>
      <Card>
        <CardHeader
          title={identity.fullName}
          avatar={<Avatar src={avatarUrl} />}
          subheader={identity.email}
        />
      </Card>

      <Card>
        <CardHeader
          title={translate('gt.profile.credentials', { _: 'Credentials' })}
        />
        <CardActions>
          <TwitchOAuthButton tokens={profile.twitch} />
        </CardActions>
      </Card>

      <Card>
        <CardHeader title={translate('gt.profile.title', { _: 'Profile' })} />
        <CardContent>
          <TimezoneSelect
            value={profile.timezone}
            onChange={(timezone) => {
              console.log('timezone changed', timezone);
            }}
            label={translate('gt.profile.timezone', { _: 'Timezone' })}
          />

          <TagInputRaw
            label={translate('gt.profile.standardTags', {
              _: 'Standard Tags',
            })}
            value={profile.standardTags}
            onChange={(tags) => {
              console.log('tags changed', tags);
            }}
          />
        </CardContent>
        <CardActions>
          <Button color="primary">
            {translate('gt.profile.save', { _: 'Save' })}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default ProfilePage;
