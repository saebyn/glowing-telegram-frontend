import type { Identifier, RaRecord } from 'react-admin';

export interface VideoClipRecord extends RaRecord {
  key: string;
  silence?: Array<{ start: number; end: number }>;
  transcript?: {
    language: string;
    text: string;
    segments: Array<{
      start: number;
      end: number;
      avg_logprob: number;
      compression_ratio: number;
      no_speech_prob: number;
      temperature: number;
      text: string;
    }>;
  };
  summary?: {
    attentions: Array<{
      timestamp_start: number;
      timestamp_end: number;
      description: number;
      reasoning: number;
    }>;
    highlights: Array<{
      timestamp_start: number;
      timestamp_end: number;
      description: number;
      reasoning: number;
    }>;
    keywords: Array<string>;

    summary_context: string;
    summary_main_discussion: string;
    title: string;
    transcription_errors: Array<{
      timestamp_start: number;
      description: number;
      reasoning: number;
    }>;
  };
  start_time: number;
  stream_id: Identifier;
  metadata?: {
    format: {
      duration: number;
      [key: string]: unknown;
    };
    streams: unknown;
  };
  keyframes?: string[];
  audio?: string;
}

export interface StreamRecord extends RaRecord {
  duration: number;
  created_at: string;
  description: string;
  has_episodes: boolean;
  prefix: string;
  series_id: Identifier;
  stream_date: string;
  title: string;
  updated_at: string;
  stream_platform: string;
  thumbnail_url: string;
  video_clip_count: number;
}

export interface EpisodeRecord extends RaRecord {
  title: string;
  description: string;
  tracks: Array<{ start: string; end: string }>;
  stream_id: Identifier;
}
