import CountdownTimerWidget from '@/widgets/CountdownTimerWidget';
import { useParams } from 'react-router-dom';

function StreamWidget() {
  const { widget, params } = useParams();

  const parsedParams = parseParams(params);

  if (!parsedParams) {
    return <p>Invalid params</p>;
  }

  switch (widget) {
    case 'countdown':
      return <CountdownTimerWidget {...parsedParams} />;
    default:
      return <p>Unknown widget: {widget}</p>;
  }
}

function parseParams(params: string | undefined) {
  if (!params) {
    return null;
  }
  try {
    return JSON.parse(atob(params));
  } catch (e) {
    return null;
  }
}

export default StreamWidget;
