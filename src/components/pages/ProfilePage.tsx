import CheckIcon from '@mui/icons-material/Check';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  TextField,
  Typography,
} from '@mui/material';
import { type ChangeEvent, useEffect, useState } from 'react';
import {
  LoadingIndicator,
  useNotify,
  useTranslate,
  useUpdate,
} from 'react-admin';
import {
  type EventSubSubscription,
  getEventSubChatStatus,
  subscribeToEventSubChat,
} from '@/api';
import TagEditor from '@/components/atoms/TagEditor';
import TimezoneSelect from '@/components/atoms/TimezoneSelect';
import TwitchOAuthButton from '@/components/atoms/TwitchOAuthButton';
import YouTubeOAuthButton from '@/components/atoms/YouTubeOAuthButton';
import {
  DEFAULT_PROMPT_TEMPLATE,
  DEFAULT_SUMMARY_TEMPLATE,
} from '@/constants/ingestTemplates';
import useProfile, { type Profile } from '@/hooks/useProfile';

const ProfilePage = () => {
  const translate = useTranslate();
  const notify = useNotify();

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
    has_active_subscription: boolean;
    subscriptions: EventSubSubscription[];
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
          setEventSubChatStatus({
            has_active_subscription: false,
            subscriptions: [],
          });
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
      setEventSubChatStatus({
        has_active_subscription: true,
        subscriptions: response.subscription ? [response.subscription] : [],
      });

      // Update profile state
      setProfileUpdate((profile) => ({
        ...profile,
        twitchChatEnabled: true,
      }));
    } catch (error) {
      console.error('Failed to enable EventSub chat subscription:', error);
      notify('gt.profile.enableTwitchChatError', {
        type: 'error',
        messageArgs: {
          _: 'Failed to enable chat integration. Please try again.',
        },
      });
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

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {translate('gt.profile.ingestTemplates', {
                  _: 'Ingest Templates',
                })}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {translate('gt.profile.ingestTemplatesDescription', {
                  _: 'Customize the templates used when ingesting stream videos. Available variables: {title}, {date}, {platform}, {duration}, {description}',
                })}
              </Typography>

              <TextField
                label={translate('gt.profile.promptTemplate', {
                  _: 'Prompt Template',
                })}
                value={
                  profileUpdate.promptTemplate ?? profile.promptTemplate ?? ''
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setProfileUpdate((profile) => ({
                    ...profile,
                    promptTemplate: e.target.value,
                  }));
                }}
                fullWidth
                multiline
                rows={4}
                placeholder={DEFAULT_PROMPT_TEMPLATE.trim()}
                sx={{ mb: 2 }}
              />

              <TextField
                label={translate('gt.profile.summaryTemplate', {
                  _: 'Summary Template',
                })}
                value={
                  profileUpdate.summaryTemplate ?? profile.summaryTemplate ?? ''
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setProfileUpdate((profile) => ({
                    ...profile,
                    summaryTemplate: e.target.value,
                  }));
                }}
                fullWidth
                multiline
                rows={6}
                placeholder={DEFAULT_SUMMARY_TEMPLATE.trim()}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {translate('gt.profile.twitchChatIntegration', {
                  _: 'Twitch Chat Integration',
                })}
              </Typography>

              {!profile?.twitch?.accessToken && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {translate('gt.profile.twitchChatRequiresAuth', {
                    _: 'Connect to Twitch to enable chat integration',
                  })}
                </Typography>
              )}

              {profile?.twitch?.accessToken &&
                eventSubChatStatus?.has_active_subscription && (
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

              {profile?.twitch?.accessToken &&
                !eventSubChatStatus?.has_active_subscription && (
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

              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
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
