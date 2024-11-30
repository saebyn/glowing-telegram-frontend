import type { StreamEvent } from '@/scheduling/types';
import type { Profile } from '@/useProfile';

interface StreamInfoEditorProps {
  stream: StreamEvent;
  profile: Profile;
}

function StreamInfoEditor({ stream, profile }: StreamInfoEditorProps) {
  // TODO
  // - Add a form to edit the stream information
  // - Add a button to save the changes to twitch
  // - Add a button to load the stream information from twitch
  // - Add a button to popluate the stream information from the profile and stream data

  return (
    <>
      <h1>Stream Info Editor</h1>
      <p>Stream: {stream.name}</p>
      <p>Profile: {profile.fullName}</p>
    </>
  );
}

export default StreamInfoEditor;
