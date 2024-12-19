import { userManager } from '@/auth';
import type { DataProvider, GetListParams, Identifier } from 'react-admin';
import { HttpError, combineDataProviders } from 'react-admin';

const { VITE_API_URL: baseApiUrl } = import.meta.env;

const resourceMap = {
  stream_plans: 'records/series',
  profile: 'records/profiles',
  streams: 'records/streams',
  episodes: 'records/episodes',
  video_clips: 'records/video_clips',
} as const;

const dataProvider = combineDataProviders((resource) => {
  if (resource in resourceMap) {
    return restDataProvider;
  }

  if (resource === 'twitch_streams') {
    return twitchVideosDataProvider;
  }

  throw new Error(`Unknown resource: ${resource}`);
});

export default dataProvider;

const restDataProvider: DataProvider = {
  getList: async (resource, params) => {
    console.log('GET LIST', resource, params);

    const data: {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      items: any[];
      cursor: string | null;
    } = await fetchResourceData(resource, undefined, 'GET', {
      signal: params.signal,
      params: {
        page: params.pagination?.page,
        perPage: params.pagination?.perPage,
        sort: params.sort?.field,
        order: params.sort?.order,
        filter: params.filter,
      },
    });

    return {
      data: data.items,
      pageInfo: {
        hasNextPage: data.cursor !== null,
      },
    };
  },
  getOne: async (resource, params) => {
    console.log('GET ONE', resource, params);

    const record = await fetchResourceData(resource, params.id, 'GET', {
      signal: params.signal,
    });

    return {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      data: record as any,
    };
  },
  getMany: (resource, params) => {
    console.log('GET MANY', resource, params);
    alert('GET MANY not implemented');
    return Promise.resolve({ data: [] });
  },
  getManyReference: (resource, params) => {
    console.log('GET MANY REFERENCE', resource, params);
    alert('GET MANY REFERENCE not implemented');
    return Promise.resolve({ data: [] });
  },
  create: async (resource, params) => {
    console.log('CREATE', resource, params);

    const result = await fetchResourceData(resource, undefined, 'POST', {
      data: params.data,
    });

    return {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      data: result as any,
    };
  },
  update: async (resource, params) => {
    console.log('UPDATE', resource, params);

    const result = await fetchResourceData(resource, params.id, 'PUT', {
      data: params.data,
    });

    return {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      data: result as any,
    };
  },
  updateMany: (resource, params) => {
    console.log('UPDATE MANY', resource, params);
    alert('UPDATE MANY not implemented');
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return Promise.resolve({ data: {} as any });
  },
  delete: async (resource, params) => {
    console.log('DELETE', resource, params);

    await fetchResourceData(resource, params.id, 'DELETE', undefined);

    return {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      data: params.previousData as any,
    };
  },
  deleteMany: (resource, params) => {
    console.log('DELETE MANY', resource, params);
    alert('DELETE MANY not implemented');
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return Promise.resolve({ data: {} as any });
  },

  supportAbortSignal: true,
};

const twitchVideosDataProvider = {
  cursorPage: 1,
  cursor: '',

  async getList(
    this: { cursorPage: number; cursor: string },
    _resource: string,
    params: GetListParams,
  ) {
    const page = params.pagination?.page || 1;
    let cursor = '';

    if (page === this.cursorPage) {
      cursor = this.cursor;
    }

    const url = new URL('twitch/videos', baseApiUrl);
    url.searchParams.append('after', cursor);

    const res = await fetch(url);
    const result = await res.json();

    if (page === this.cursorPage && result.pagination?.cursor) {
      this.cursor = result.pagination?.cursor;
      this.cursorPage = page + 1;
    }

    return {
      data: result.data,
      pageInfo: {
        hasNextPage: result.pagination?.cursor,
        hasPreviousPage: false,
      },
    };
  },
} as unknown as DataProvider;

function getResourceUrl(
  resource: string,
  recordId: Identifier | undefined,
): URL {
  validateResource(resource);

  const url = new URL(resourceMap[resource], baseApiUrl);

  if (recordId) {
    url.pathname += `/${recordId}`;
  }

  return url;
}

async function fetchResourceData<T>(
  resource: string,
  recordId: Identifier | undefined,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  options?: {
    signal?: AbortSignal;
    params?: Record<string, unknown>;
    data?: Record<string, unknown>;
  },
): Promise<T> {
  validateResource(resource);

  const user = await userManager.getUser();

  if (!user) {
    throw new Error('User not found');
  }

  const token = user.id_token;

  const url = getResourceUrl(resource, recordId);

  const { signal, params, data } = options || {};

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        url.searchParams.append(key, value);
      } else {
        url.searchParams.append(key, JSON.stringify(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    body: data ? JSON.stringify(data) : undefined,
    method,
    signal,
    headers: {
      Authorization: `${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();

    console.error('Error fetching data', response.status, text);

    let body: unknown;
    let message = '';

    try {
      const json = JSON.parse(text);
      body = json;
      message = json.message;
    } catch (e) {
      body = text;
      message = response.statusText || `${response.status} error`;
    }

    throw new HttpError(message, response.status, body);
  }

  return response.json();
}

function validateResource(
  resource: string,
): asserts resource is keyof typeof resourceMap {
  if (resource in resourceMap === false) {
    throw new Error(`Unknown resource: ${resource}`);
  }
}
