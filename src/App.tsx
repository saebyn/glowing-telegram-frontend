import localForageDataProvider from 'ra-data-local-forage';
import { useEffect, useState } from 'react';
import { Admin, type DataProvider, Resource } from 'react-admin';

import StreamPlansCreate from './resources/stream_plans/StreamPlansCreate';
import StreamPlansEdit from './resources/stream_plans/StreamPlansEdit';
import StreamPlansList from './resources/stream_plans/StreamPlansList';

import defaultData from '../defaultData.json';
import i18nProvider from './i18nProvider';

function App() {
  const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);

  useEffect(() => {
    async function startDataProvider() {
      const localForageProvider = await localForageDataProvider({
        defaultData,
        loggingEnabled: true,
      });
      setDataProvider(localForageProvider);
    }

    if (dataProvider === null) {
      startDataProvider();
    }
  }, [dataProvider]);

  // hide the admin until the data provider is ready
  if (!dataProvider) return <p>Loading...</p>;

  return (
    <Admin dataProvider={dataProvider} i18nProvider={i18nProvider}>
      <Resource
        name="stream_plans"
        list={StreamPlansList}
        create={StreamPlansCreate}
        edit={StreamPlansEdit}
      />
    </Admin>
  );
}

export default App;
