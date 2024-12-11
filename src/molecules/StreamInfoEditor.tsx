import LanguageSelect from '@/atoms/LanguageSelect';
import TagEditor from '@/atoms/TagEditor';
import TwitchCCTAutocomplete from '@/atoms/TwitchCCLSelect';
import TwitchCategoryAutocomplete from '@/atoms/TwitchCategoryAutocomplete';
import type { StreamEvent } from '@/scheduling/types';
import {
  type GetChannelInformationResponse,
  getChannelInformation,
  modifyChannelInformation,
} from '@/twitch';
import type { Profile } from '@/useProfile';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Checkbox from '@mui/material/Checkbox';
import LoadingIndicator from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

import { useEffect, useState } from 'react';
import { useTranslate } from 'react-admin';

interface StreamInfoEditorProps {
  nextScheduledStream: StreamEvent | null;
  profile: Profile;
}

function StreamInfoEditor({
  nextScheduledStream,
  profile,
}: StreamInfoEditorProps) {
  const [streamInfo, setStreamInfo] = useState<
    Partial<GetChannelInformationResponse>
  >({});
  const [reloadCount, setReloadCount] = useState(0);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const translate = useTranslate();

  // biome-ignore lint/correctness/useExhaustiveDependencies: I want to reload the stream info when the reload count changes
  useEffect(() => {
    const abortController = new AbortController();

    getChannelInformation(
      profile.twitch.broadcasterId,
      profile.twitch.accessToken,
      { signal: abortController.signal },
    )
      .then((data) => {
        setStreamInfo(data);
      })
      .catch((e) => {
        setStreamInfo({});
        setError(e);
      });

    return () => {
      abortController.abort();
    };
  }, [profile.twitch.accessToken, profile.twitch.broadcasterId, reloadCount]);

  const handleRefresh = () => {
    setReloadCount((count) => count + 1);
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      await modifyChannelInformation(
        profile.twitch.broadcasterId,
        profile.twitch.accessToken,
        streamInfo,
      );
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsPending(false);
    }
  };

  const handlePopulate = () => {
    if (!nextScheduledStream) {
      return;
    }

    const newTags = isMerging
      ? [
          ...nextScheduledStream.tags,
          ...profile.standardTags,
          ...(streamInfo.tags || []),
        ]
      : [...nextScheduledStream.tags, ...profile.standardTags];

    setStreamInfo((streamInfo) => ({
      ...streamInfo,
      game_id: nextScheduledStream.category.id,
      game_name: nextScheduledStream.category.name,
      title: nextScheduledStream.name,
      tags: newTags,
    }));
  };

  return (
    <>
      {error && (
        <Alert
          severity="error"
          action={
            <Button component="a" href="/profile">
              Go to profile
            </Button>
          }
        >
          {error.message}
        </Alert>
      )}

      {isPending && (
        <Alert severity="info">
          <LoadingIndicator />
          {translate('gt.stream_info_editor.saving', { _: 'Saving...' })}
        </Alert>
      )}

      <Box component="form">
        <TextField
          InputLabelProps={{ shrink: true }}
          label="Title"
          variant="outlined"
          value={streamInfo.title || ''}
          onChange={(event) =>
            setStreamInfo({ ...streamInfo, title: event.target.value })
          }
        />

        <TwitchCategoryAutocomplete
          label={translate('gt.stream_info_editor.category', { _: 'Category' })}
          profile={profile}
          category={
            streamInfo.game_id
              ? {
                  id: streamInfo.game_id,
                  name: streamInfo.game_name || 'Unknown',
                }
              : null
          }
          onChange={(category) => {
            setStreamInfo({
              ...streamInfo,
              game_id: category ? category.id : null,
              game_name: category?.name,
            });
          }}
        />

        <TagEditor
          value={streamInfo.tags || []}
          onChange={(tags) => setStreamInfo({ ...streamInfo, tags })}
        />

        <LanguageSelect
          value={streamInfo.broadcaster_language || 'en'}
          onChange={(language) =>
            setStreamInfo({ ...streamInfo, broadcaster_language: language })
          }
        />

        <TwitchCCTAutocomplete
          label={translate(
            'gt.stream_info_editor.content_classification_labels',
            { _: 'Content Classification Labels' },
          )}
          profile={profile}
          value={streamInfo.content_classification_labels || []}
          onChange={(labels) =>
            setStreamInfo({
              ...streamInfo,
              content_classification_labels: labels,
            })
          }
        />

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={streamInfo.is_branded_content || false}
                onChange={(event) =>
                  setStreamInfo({
                    ...streamInfo,
                    is_branded_content: event.target.checked,
                  })
                }
              />
            }
            label="Is branded content"
          />
        </FormGroup>

        <ButtonGroup variant="contained" aria-label="actions for the form">
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="contained" color="primary" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!nextScheduledStream}
            onClick={handlePopulate}
          >
            Populate
          </Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={isMerging}
                onChange={(event) => setIsMerging(event.target.checked)}
              />
            }
            label={translate('gt.profile.mergeTags', { _: 'Merge tags' })}
          />
        </ButtonGroup>
      </Box>
    </>
  );
}

export default StreamInfoEditor;
