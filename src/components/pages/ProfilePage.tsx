import {
  getEventSubChatStatus,
  subscribeToEventSubChat,
  unsubscribeFromEventSubChat,
} from '@/api';
import TagEditor from '@/components/atoms/TagEditor';
import TimezoneSelect from '@/components/atoms/TimezoneSelect';
import TwitchOAuthButton from '@/components/atoms/TwitchOAuthButton';
import YouTubeOAuthButton from '@/components/atoms/YouTubeOAuthButton';
import useProfile, { type Profile } from '@/hooks/useProfile';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useEffect, useState } from 'react';
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
  const [eventSubChatStatus, setEventSubChatStatus] = useState<{
    subscribed: boolean;
  } | null>(null);
  const [isEventSubLoading, setIsEventSubLoading] = useState(false);

  // Load the current EventSub chat status when component mounts
  useEffect(() => {
    const loadEventSubStatus = async () => {
      if (profile?.twitch?.accessToken) {
        try {
          const status = await getEventSubChatStatus();
          setEventSubChatStatus(status);
        } catch (error) {
          console.error('Failed to load EventSub chat status:', error);
          // Set default state if we can't load the status
          setEventSubChatStatus({ subscribed: false });
        }
      }
    };

    loadEventSubStatus();
  }, [profile?.twitch?.accessToken]);

  const handleTwitchChatToggle = async (checked: boolean) => {
    if (!profile?.twitch?.accessToken) {
      return;
    }

    setIsEventSubLoading(true);
    try {
      if (checked) {
        await subscribeToEventSubChat();
      } else {
        await unsubscribeFromEventSubChat();
      }

      // Update local state
      setEventSubChatStatus({ subscribed: checked });

      // Update profile state
      setProfileUpdate((profile) => ({
        ...profile,
        twitchChatEnabled: checked,
      }));
    } catch (error) {
      console.error('Failed to update EventSub chat subscription:', error);
      // Revert the toggle state on error
      setEventSubChatStatus({ subscribed: !checked });
    } finally {
      setIsEventSubLoading(false);
    }
  };

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

            <YouTubeOAuthButton
              tokens={{
                accessToken: profile.youtube?.accessToken,
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

            <FormControlLabel
              control={
                <Switch
                  checked={
                    eventSubChatStatus?.subscribed ||
                    profileUpdate.twitchChatEnabled ||
                    profile.twitchChatEnabled ||
                    false
                  }
                  onChange={(event) => {
                    handleTwitchChatToggle(event.target.checked);
                  }}
                  disabled={!profile?.twitch?.accessToken || isEventSubLoading}
                />
              }
              label={translate('gt.profile.twitchChatEnabled', {
                _: 'Enable Twitch Chat Integration',
              })}
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
