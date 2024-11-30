import { DateTime } from 'luxon';
import { useGetList } from 'react-admin';
import findNextStream from '../scheduling/findNextStream';
import useProfile from '../useProfile';

function StreamManagerPage() {
  // get the stream plans records
  const {
    data: streamPlans,
    error: streamPlanError,
    isLoading: streamPlanIsLoading,
    isError: streamPlanIsError,
  } = useGetList('stream_plans', {});

  // get the user profile
  const {
    profile,
    error: profileError,
    isPending: profileIsLoading,
  } = useProfile();

  if (streamPlanIsLoading || profileIsLoading) {
    return <p>Loading...</p>;
  }

  if (streamPlanIsError) {
    return <p>Error: {streamPlanError.message}</p>;
  }

  if (profileError) {
    return <p>Error: {profileError.message}</p>;
  }

  if (!streamPlans || !profile) {
    return <p>Missing data</p>;
  }

  const stream = findNextStream(DateTime.now(), 7, streamPlans);

  if (!stream) {
    return <p>No upcoming stream in the next 7 days</p>;
  }

  return (
    <div>
      <h1>Stream Manager</h1>

      <p>Upcoming stream</p>

      <p>{stream.name}</p>
      <p>{stream.date}</p>
      <p>{stream.time}</p>
      <p>{stream.category}</p>
    </div>
  );
}

export default StreamManagerPage;
