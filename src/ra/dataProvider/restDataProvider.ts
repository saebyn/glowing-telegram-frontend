import { userManager } from '@/utilities/auth';
import type { DataProvider, Identifier } from 'react-admin';
import { HttpError } from 'react-admin';
import * as cursorPaginationCache from './cursorPaginationCache';
import inMemoryListCache from './inMemoryListCache';
import resourceMap, { validateResource } from './resourceMap';

const { VITE_API_URL: baseApiUrl } = import.meta.env;

export interface BulkCreateParams<T = any> {
  data: Partial<T>[];
  meta?: any;
}

const restDataProvider: DataProvider = {
  bulkCreate: async (resource: string, params: BulkCreateParams) => {
    console.log('BULK CREATE', resource, params);

    await fetchResourceData(resource, undefined, 'POST', {
      data: params.data,
    });
  },

  getList: async (resource, params) => {
    console.log('GET LIST', resource, params);

    const page = params.pagination?.page || 1;

    const fetchSignature = JSON.stringify({
      resource,
      perPage: params.pagination?.perPage,
      filter: params.filter,
      page,
    });

    let cachedData = inMemoryListCache.get(fetchSignature);

    if (cachedData === undefined) {
      console.debug('Cache miss', fetchSignature);
      const data: { items: any[]; cursor: string | null } =
        await fetchResourceData(resource, undefined, 'GET', {
          signal: params.signal,
          params: {
            cursor: cursorPaginationCache.getNext(fetchSignature, page),
            perPage: params.pagination?.perPage,
            filter: params.filter,
          },
        });
      if (data.cursor) {
        cursorPaginationCache.set(fetchSignature, page, data.cursor);
      }
      inMemoryListCache.set(fetchSignature, data);
      cachedData = data;
    }

    const { items, cursor } = cachedData;

    // Sort items by params.sort.field and params.sort.order
    // Copy the array to avoid mutating the cache
    const sortedItems = items.slice().sort((a, b) => {
      const field = params.sort?.field;

      if (!field) {
        return 0;
      }

      const aValue = a[field]?.toString() || '';
      const bValue = b[field]?.toString() || '';

      if (aValue < bValue) {
        return params.sort?.order === 'ASC' ? -1 : 1;
      }

      if (aValue > bValue) {
        return params.sort?.order === 'ASC' ? 1 : -1;
      }

      return 0;
    });

    return {
      data: sortedItems as any[],
      pageInfo: {
        hasNextPage: cursor !== null,
        hasPreviousPage: page > 1,
      },
    };
  },
  getOne: async (resource, params) => {
    console.log('GET ONE', resource, params);

    const record = await fetchResourceData(resource, params.id, 'GET', {
      signal: params.signal,
    });

    return {
      data: cleanRecord(resource)(record as any) as any,
    };
  },
  getMany: async (resource, params) => {
    console.log('GET MANY', resource, params);

    const results = await fetchResourceData<{
      items: Record<string, unknown>[];
    }>(resource, undefined, 'GET', {
      signal: params.signal,
      params: {
        filter: JSON.stringify({ id: params.ids }),
      },
    });

    return {
      data: results.items.map(cleanRecord(resource)) as any[],
    };
  },
  getManyReference: async (resource, params) => {
    console.log('GET MANY REFERENCE', resource, params);

    const results = await fetchResourceData<{
      items: Record<string, unknown>[];
    }>(resource, params.id, 'GET', {
      signal: params.signal,
      relatedFieldName: params.target,
    });

    return {
      data: results.items.map(cleanRecord(resource)) as any[],
      pageInfo: {
        // TODO: Implement pagination
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  },
  create: async (resource, params) => {
    console.log('CREATE', resource, params);

    const record = await fetchResourceData(resource, undefined, 'POST', {
      data: params.data,
    });

    return {
      data: cleanRecord(resource)(record as any) as any,
    };
  },
  update: async (resource, params) => {
    console.log('UPDATE', resource, params);

    const record = await fetchResourceData(resource, params.id, 'PUT', {
      data: params.data,
    });

    return {
      data: cleanRecord(resource)(record as any) as any,
    };
  },
  updateMany: (resource, params) => {
    console.log('UPDATE MANY', resource, params);
    alert('UPDATE MANY not implemented');
    return Promise.resolve({ data: {} as any });
  },
  delete: async (resource, params) => {
    console.log('DELETE', resource, params);

    await fetchResourceData(resource, params.id, 'DELETE', {
      ignoreResponseBody: true,
    });

    return {
      data: params.previousData as any,
    };
  },
  deleteMany: (resource, params) => {
    console.log('DELETE MANY', resource, params);
    alert('DELETE MANY not implemented');
    return Promise.resolve({ data: {} as any });
  },

  supportAbortSignal: true,
};

export default restDataProvider;

function getResourceUrl(
  resource: string,
  recordId: Identifier | undefined,
  relatedFieldName?: string,
): URL {
  validateResource(resource);

  const url = new URL(resourceMap[resource], baseApiUrl);

  if (relatedFieldName) {
    url.pathname += `/${relatedFieldName}`;
  }

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
    ignoreResponseBody?: boolean;
    signal?: AbortSignal;
    params?: Record<string, unknown>;
    data?: Record<string, unknown> | Record<string, unknown>[];
    relatedFieldName?: string;
  },
): Promise<T> {
  validateResource(resource);

  const user = await userManager.getUser();

  if (!user) {
    throw new Error('User not found');
  }

  const token = user.id_token;

  const url = getResourceUrl(resource, recordId, options?.relatedFieldName);

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
      'Content-Type': 'application/json',
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

  if (options?.ignoreResponseBody) {
    return {} as T;
  }

  return response.json();
}

function cleanRecord(resource: string) {
  return (record: Record<string, unknown>) => {
    if (resource === 'video_clips') {
      record.id = record.key;
    }

    return record;
  };
}
