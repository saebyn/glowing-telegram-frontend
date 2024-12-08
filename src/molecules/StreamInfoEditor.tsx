import TagEditor from '@/atoms/TagEditor';
import TwitchCCTAutocomplete from '@/atoms/TwitchCCTAutocomplete';
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
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
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
      title: nextScheduledStream.name,
      tags: newTags,
    }));
  };

  return (
    <>
      <h1>Stream Info Editor</h1>

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
          value={streamInfo.title}
          onChange={(event) =>
            setStreamInfo({ ...streamInfo, title: event.target.value })
          }
        />

        <TwitchCategoryAutocomplete
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
            });
          }}
        />

        <TagEditor
          value={streamInfo.tags || []}
          onChange={(tags) => setStreamInfo({ ...streamInfo, tags })}
        />

        <FormControl>
          <InputLabel>Language</InputLabel>
          <Select
            value={streamInfo.broadcaster_language || 'en'}
            onChange={(event) =>
              setStreamInfo({
                ...streamInfo,
                broadcaster_language: event.target.value,
              })
            }
          >
            <MenuItem value={'en'}>English</MenuItem>
            <MenuItem value={'other'}>Other</MenuItem>
          </Select>
        </FormControl>

        <TwitchCCTAutocomplete />

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
