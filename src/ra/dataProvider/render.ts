import { userManager } from '@/utilities/auth';

const { VITE_API_URL: baseApiUrl } = import.meta.env;

const renderDataProvider = {
  updateMany: async (_resource: string, params: { ids: string[] }) => {
    const { ids } = params;

    const user = await userManager.getUser();

    if (!user) {
      throw new Error('User not found');
    }

    const token = user.id_token;

    const url = new URL('render', baseApiUrl);

    await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        episodeIds: ids,
      }),
    });

    return { data: ids };
  },
};

export default renderDataProvider;
