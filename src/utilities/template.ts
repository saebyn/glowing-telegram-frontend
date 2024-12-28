import type { SeriesRecord } from '@/types/dataProvider';

export default function template(str: string, data: Record<string, string>) {
  return str.replace(/\${(.*?)}/g, (_match, key) => data[key] || '');
}

export function templateStreamSeries(series: SeriesRecord): string {
  if (series.stream_title_template) {
    return template(series.stream_title_template, {
      title: series.title,
      stream_count: `${series.stream_count || 1}`,
    });
  }

  return 'No title template set';
}