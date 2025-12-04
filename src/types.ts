export interface TranscriptSegment {
  start: string;
  end: string;
  text: string;
}

export interface YoutubeUploadTaskPayload {
  episode_id: string;
  title: string;
  description: string;
  tags: string[];
  category: number;
  render_uri: string;
  notify_subscribers: boolean;

  task_title: string;
}

export interface ChatMessage {
  content: string;
  role: 'system' | 'user' | 'assistant' | 'function';
}

export interface DataStreamDataElement {
  start: number;
  end: number;
  density?: number;
}

interface Metadata {
  filename: string;
  content_type: string;
  size: number;
  last_modified: string;

  duration: string;
  start_time: string;
  width: number | null;
  height: number | null;
  frame_rate: number | null;
  video_bitrate: number | null;
  audio_bitrate: number | null;
  audio_track_count: number | null;
}

interface FileEntry {
  metadata: Metadata;
  uri: string;
}

export interface FindFilesResponse {
  entries: FileEntry[];
}

export interface StreamChatMessage {
  id: string;
  user_id?: string;
  channel_id?: string;
  timestamp: number;
  username: string;
  message: string;
  created_at?: string;
  updated_at?: string;
}
