import TagEditor from '@/components/atoms/TagEditor';
import TimezoneSelect from '@/components/atoms/TimezoneSelect';
import TwitchOAuthButton from '@/components/atoms/TwitchOAuthButton';
import useProfile, { type Profile } from '@/hooks/useProfile';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@mui/material';
import { useState } from 'react';
import { LoadingIndicator, useTranslate, useUpdate } from 'react-admin';

const ProfilePage = () => {
  const translate = useTranslate();

  const { profile, isPending, error } = useProfile();
  const [
    update,
    {
      isPending: isPendingUpdate,
      isIdle: isIdleUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
    },
  ] = useUpdate();

  const [profileUpdate, setProfileUpdate] = useState<Partial<Profile>>({});

  if (isPending) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <>
      {isPendingUpdate || isIdleUpdate ? <LoadingIndicator /> : null}

      {isErrorUpdate ? (
        <div>
          <h1>{translate('gt.profile.error', { _: 'Error' })}</h1>
          <p>
            {translate('gt.profile.errorSaving', {
              _: 'There was an error saving the profile',
            })}
          </p>
          <p>{errorUpdate.message}</p>
        </div>
      ) : null}

      <Box>
        <Card>
          <CardHeader
            title={profile.fullName}
            avatar={<Avatar src={profile.avatar} />}
            subheader={profile.email}
          />
        </Card>

        <Card>
          <CardHeader
            title={translate('gt.profile.credentials', { _: 'Credentials' })}
          />
          <CardActions>
            <TwitchOAuthButton
              tokens={{
                accessToken: profile.twitch?.accessToken,
              }}
            />
          </CardActions>
        </Card>

        <Card>
          <CardHeader title={translate('gt.profile.title', { _: 'Profile' })} />
          <CardContent>
            <TimezoneSelect
              value={profileUpdate.timezone || profile.timezone}
              onChange={(timezone) => {
                setProfileUpdate((profile) => ({
                  ...profile,
                  timezone,
                }));
              }}
              label={translate('gt.profile.timezone', { _: 'Timezone' })}
            />

            <TagEditor
              label={translate('gt.profile.standardTags', {
                _: 'Standard Tags',
              })}
              maxTags={5}
              value={profileUpdate.standardTags || profile.standardTags}
              onChange={(tags) => {
                setProfileUpdate((profile) => ({
                  ...profile,
                  standardTags: tags,
                }));
              }}
            />
          </CardContent>
          <CardActions>
            <Button
              color="primary"
              onClick={() =>
                update('profile', {
                  data: profileUpdate,
                  id: 'my-profile',
                })
              }
            >
              {translate('gt.profile.save', { _: 'Save' })}
            </Button>
          </CardActions>
        </Card>
      </Box>
    </>
  );
};

export default ProfilePage;
