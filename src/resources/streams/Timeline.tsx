import { useGetManyReference } from 'react-admin';
import { useParams } from 'react-router-dom';

function Timeline() {
  const { id } = useParams();

  const { data, total, isPending, error, refetch } = useGetManyReference(
    'video_clips',
    {
      target: 'stream_id',
      id,
    },
  );

  const handleRefresh = () => {
    refetch();
  };

  if (isPending) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Timeline</h1>
      <div>
        {data.map((record) => (
          <div key={record.id}>
            <span>{record.key}</span>
            <span>{record.start_time}</span>
            <pre>{JSON.stringify(record.silence, null, 2)}</pre>
          </div>
        ))}
      </div>
      <span>Total: {total}</span>
      <button type="button" onClick={handleRefresh}>
        Refresh
      </button>
    </div>
  );
}

export default Timeline;
