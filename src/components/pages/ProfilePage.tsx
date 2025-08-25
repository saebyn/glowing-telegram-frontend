import {
  type EventSubSubscription,
  getEventSubChatStatus,
  subscribeToEventSubChat,
} from '@/api';
import TagEditor from '@/components/atoms/TagEditor';
import TimezoneSelect from '@/components/atoms/TimezoneSelect';
import TwitchOAuthButton from '@/components/atoms/TwitchOAuthButton';
import YouTubeOAuthButton from '@/components/atoms/YouTubeOAuthButton';
import useProfile, { type Profile } from '@/hooks/useProfile';
import CheckIcon from '@mui/icons-material/Check';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
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
    subscription?: EventSubSubscription;
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

  const handleEnableTwitchChat = async () => {
    if (!profile?.twitch?.accessToken) {
      return;
    }

    setIsEventSubLoading(true);
    try {
      const response = await subscribeToEventSubChat();
      console.log('Subscribe response:', response);

      // Update local state to reflect successful subscription
      setEventSubChatStatus({ subscribed: true });

      // Update profile state
      setProfileUpdate((profile) => ({
        ...profile,
        twitchChatEnabled: true,
      }));
    } catch (error) {
      console.error('Failed to enable EventSub chat subscription:', error);
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

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {translate('gt.profile.twitchChatIntegration', {
                  _: 'Twitch Chat Integration',
                })}
              </Typography>

              {!profile?.twitch?.accessToken && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {translate('gt.profile.twitchChatRequiresAuth', {
                    _: 'Connect to Twitch to enable chat integration',
                  })}
                </Typography>
              )}

              {profile?.twitch?.accessToken && eventSubChatStatus?.subscribed && (
                <Button
                  variant="contained"
                  color="success"
                  disabled
                  startIcon={<CheckIcon />}
                  sx={{ mb: 1 }}
                >
                  {translate('gt.profile.twitchChatEnabled', {
                    _: 'Chat Integration Enabled',
                  })}
                </Button>
              )}

              {profile?.twitch?.accessToken && !eventSubChatStatus?.subscribed && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEnableTwitchChat}
                  disabled={isEventSubLoading}
                  sx={{ mb: 1 }}
                >
                  {isEventSubLoading
                    ? translate('gt.profile.enabling', { _: 'Enabling...' })
                    : translate('gt.profile.enableTwitchChat', {
                        _: 'Enable Chat Integration',
                      })}
                </Button>
              )}

              <Typography variant="caption" display="block" color="text.secondary">
                {translate('gt.profile.twitchChatDescription', {
                  _: 'Enable integration to collect chat messages during your Twitch streams',
                })}
              </Typography>
            </Box>
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
