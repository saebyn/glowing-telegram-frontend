const resourceMap = {
  series: 'records/series',
  profile: 'records/profiles',
  streams: 'records/streams',
  episodes: 'records/episodes',
  tasks: 'records/tasks',
  video_clips: 'records/video_clips',
  projects: 'records/projects',
  streamIngest: 'stream',
  stream_widgets: 'records/stream_widgets',
  chat: 'records/chat_messages',
} as const;

export default resourceMap;

export function validateResource(
  resource: string,
): asserts resource is keyof typeof resourceMap {
  if (resource in resourceMap === false) {
    throw new Error(`Unknown resource: ${resource}`);
  }
}
