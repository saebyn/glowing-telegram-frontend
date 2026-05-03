import type { DataProvider, Identifier } from 'react-admin';
import { HttpError } from 'react-admin';
import { authenticatedFetch } from '@/api';
import { API_URL } from '@/environment';
import * as cursorPaginationCache from './cursorPaginationCache';
import resourceMap, { validateResource } from './resourceMap';

export interface BulkCreateParams<T = any> {
  data: Partial<T>[];
  meta?: any;
}

/**
  * `sortData`
  *
  * Returns a sorted copy of the given items based on the specified field and sort order.
  *
  * If `field` is not provided, no sorting is applied and the original items are returned.
  * If `sortOrder` is not provided, it defaults to descending order (DESC).
  *
  */
function sortData<T extends Record<string, unknown>>(items: T[], field?: string, sortOrder?: 'ASC' | 'DESC'): T[] {
  if (!field) {
    return items;
  }

  // Sort items by params.sort.field and params.sort.order
  // Copy the array to avoid mutating the cache
  return items.slice().sort((a, b) => {
    if (!field) {
      return 0;
    }

    const aValue = a[field] || '';
    const bValue = b[field] || '';

    if (aValue < bValue) {
      return sortOrder === 'ASC' ? -1 : 1;
    }

    if (aValue > bValue) {
      return sortOrder === 'ASC' ? 1 : -1;
    }

    return 0;
  });
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

    return fetchPaginatedData(resource, undefined, undefined, params) as any;
  },
  getOne: async (resource, params) => {
    console.log('GET ONE', resource, params);

    const record = await fetchResourceData(resource, params.id, 'GET', {
      signal: params.signal,
    });

    // For stream_s3_status, the record doesn't have an id field, so we add it
    const recordWithId =
      resource === 'stream_s3_status'
        ? { ...(record as Record<string, unknown>), id: params.id }
        : record;

    return {
      data: cleanRecord(resource)(recordWithId as any) as any,
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

    return fetchPaginatedData(resource, params.id, params.target, params) as any;
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

    const record = await fetchResourceData<Record<string, unknown>>(
      resource,
      params.id,
      'PUT',
      {
        data: params.data,
      },
    );

    return {
      data: cleanRecord(resource)(record) as any,
    };
  },
  updateMany: (resource, params) => {
    console.log('UPDATE MANY', resource, params);
    alert('UPDATE MANY not implemented');
    return Promise.resolve({ data: [] });
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

async function fetchPaginatedData(
  resource: string,
  recordId: Identifier | undefined,
  relatedFieldName: string | undefined,
  params: {
    pagination?: { page?: number; perPage?: number };
    filter?: any;
    sort?: { field?: string; order?: string };
    signal?: AbortSignal;
  },
) {
  const page = params.pagination?.page || 1;

  const fetchSignature = JSON.stringify({
    resource,
    recordId,
    relatedFieldName,
    perPage: params.pagination?.perPage,
    filter: params.filter,
  });

  const lastCursor = cursorPaginationCache.getNext(fetchSignature, page);

  if (page > 1 && !lastCursor) {
    return {
      data: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
      },
    };
  }

  const perPage = params.pagination?.perPage ?? 10;
  const allItems: any[] = [];
  let cursor: string | null = lastCursor ?? null;
  let isFirstFetch = true;

  while (allItems.length < perPage) {
    // Only use lastCursor on the first fetch; subsequent fetches use the
    // cursor returned by the previous response.
    if (!isFirstFetch && cursor === null) {
      break;
    }

    const data: { items: any[]; cursor: string | null } =
      await fetchResourceData(resource, recordId, 'GET', {
        signal: params.signal,
        relatedFieldName,
        params: {
          cursor: isFirstFetch ? lastCursor : cursor,
          perPage: params.pagination?.perPage,
          filter: params.filter,
        },
      });

    cursor = data.cursor;
    allItems.push(...data.items);
    isFirstFetch = false;
  }

  if (cursor) {
    cursorPaginationCache.set(fetchSignature, page, cursor);
  }

  return {
    data: sortData(
      allItems.map(cleanRecord(resource)),
      params.sort?.field,
      params.sort?.order as 'ASC' | 'DESC' | undefined,
    ) as any[],
    pageInfo: {
      hasNextPage: cursor !== null,
      hasPreviousPage: page > 1,
    },
  };
}

function getResourceUrl(
  resource: string,
  recordId: Identifier | undefined,
  relatedFieldName?: string,
): URL {
  validateResource(resource);

  const url = new URL(resourceMap[resource], API_URL);

  if (relatedFieldName) {
    url.pathname += `/${relatedFieldName}`;
  }

  if (recordId) {
    url.pathname += `/${recordId}`;
  }

  // Special handling for stream_s3_status to append /s3-status
  if (resource === 'stream_s3_status' && recordId) {
    url.pathname += '/s3-status';
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

  const response = await authenticatedFetch(url.toString(), {
    body: data ? JSON.stringify(data) : undefined,
    method,
    signal,
    headers: {
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
    } catch (_e) {
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

    if (resource === 'streamIngest') {
      record.id = record.executionArn;
    }

    return record;
  };
}
