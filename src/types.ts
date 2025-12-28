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

type WidgetState = Record<string, unknown>;
type WidgetConfig = Record<string, unknown>;

// Widget Types
export interface WidgetInstance<
  T extends WidgetState = WidgetState,
  U extends WidgetConfig = WidgetConfig,
> {
  id: string;
  title: string;
  user_id: string;
  type: string;
  access_token: string;
  config: U;
  state: T;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CountdownTimerConfig extends WidgetConfig {
  timerId: string;
  text: string;
  title: string;
  duration: number;
  // Appearance customization
  showBackground?: boolean;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  showProgressBar?: boolean;
  showOriginalDuration?: boolean;
  showText?: boolean;
  showTitle?: boolean;
  // Size configuration
  width?: number; // Widget width in pixels
  height?: number; // Widget height in pixels
}

export interface CountdownTimerState extends WidgetState {
  duration_left: number;
  enabled: boolean;
  last_tick_timestamp: string;
}

export type CountdownTimerWidgetInstance = WidgetInstance<
  CountdownTimerState,
  CountdownTimerConfig
>;
