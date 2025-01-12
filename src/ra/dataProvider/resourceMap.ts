const resourceMap = {
  series: 'records/series',
  profile: 'records/profiles',
  streams: 'records/streams',
  episodes: 'records/episodes',
  tasks: 'records/tasks',
  video_clips: 'records/video_clips',
  streamIngest: 'stream',
} as const;

export default resourceMap;

export function validateResource(
  resource: string,
): asserts resource is keyof typeof resourceMap {
  if (resource in resourceMap === false) {
    throw new Error(`Unknown resource: ${resource}`);
  }
}
