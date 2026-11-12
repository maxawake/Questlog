import type { Account, Journal, QuestInput, QuestPatch, Quest, ServerConfig } from './types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function normalize(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

async function request<T>(
  baseUrl: string,
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
  csrf?: string
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (csrf) headers['X-CSRF-Token'] = csrf;
  let response: Response;
  try {
    response = await fetch(`${normalize(baseUrl)}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the Questlog server. Check the address and your connection.', 0);
  }
  let result: Record<string, unknown> = {};
  try {
    result = await response.json();
  } catch {
    // Non-JSON response; fall through with an empty body.
  }
  if (!response.ok) {
    const detail = typeof result.detail === 'string' ? result.detail : 'The request could not be completed.';
    throw new ApiError(detail, response.status);
  }
  return result as T;
}

export const api = {
  config: (baseUrl: string) => request<ServerConfig>(baseUrl, '/api/config'),
  login: (baseUrl: string, username: string, password: string) =>
    request<Account>(baseUrl, '/api/login', 'POST', { username, password }),
  session: (baseUrl: string) => request<Account>(baseUrl, '/api/session'),
  logout: (baseUrl: string, csrf: string) => request<{ ok: boolean }>(baseUrl, '/api/logout', 'POST', {}, csrf),
  lists: (baseUrl: string) => request<Journal[]>(baseUrl, '/api/lists'),
  createList: (baseUrl: string, csrf: string, title: string) =>
    request<Journal[]>(baseUrl, '/api/lists', 'POST', { title }, csrf),
  quests: (baseUrl: string, listId: string) =>
    request<Quest[]>(baseUrl, `/api/quests?list_id=${encodeURIComponent(listId)}`),
  createQuest: (baseUrl: string, csrf: string, payload: QuestInput) =>
    request<{ id: string }>(baseUrl, '/api/quests', 'POST', payload, csrf),
  updateQuest: (baseUrl: string, csrf: string, uid: string, payload: QuestPatch) =>
    request<{ ok: boolean }>(baseUrl, `/api/quests/${encodeURIComponent(uid)}`, 'PATCH', payload, csrf),
  deleteQuest: (baseUrl: string, csrf: string, uid: string, payload: { list_id: string; etag: string }) =>
    request<{ ok: boolean }>(baseUrl, `/api/quests/${encodeURIComponent(uid)}`, 'DELETE', payload, csrf),
};
