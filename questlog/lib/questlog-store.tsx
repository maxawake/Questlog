import * as Crypto from 'expo-crypto';
import NetInfo from '@react-native-community/netinfo';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { api, ApiError } from './api';
import { demoData, descendants } from './model';
import { playTone } from './sound';
import { demoStorage, serverUrlStorage } from './storage';
import type { Account, Filter, Journal, Mode, QuestInput, QuestPatch, Quest, QuestlogData, ServerConfig } from './types';

const REFRESH_INTERVAL_MS = 20000;

export interface MutateResult {
  ok: boolean;
  error?: string;
}

interface QuestlogContextValue {
  data: QuestlogData;
  journalId: string;
  filter: Filter;
  search: string;
  mode: Mode;
  account: Account | null;
  config: ServerConfig;
  serverUrl: string;
  busy: boolean;
  offline: boolean;
  connectionError: string;
  collapsed: Set<string>;
  toastMessage: string;
  currentJournal: () => Journal | undefined;
  questsHere: () => Quest[];
  editable: (quest?: { readonly?: boolean } | null) => boolean;
  setFilter: (filter: Filter) => void;
  setSearch: (search: string) => void;
  setJournalId: (id: string) => void;
  toggleCollapsed: (id: string) => void;
  toast: (message: string) => void;
  refresh: (notify?: boolean) => Promise<void>;
  toggleQuest: (id: string) => Promise<MutateResult>;
  createQuest: (payload: QuestInput) => Promise<MutateResult>;
  updateQuest: (id: string, etag: string, payload: Partial<QuestInput>) => Promise<MutateResult>;
  deleteQuest: (id: string, etag: string) => Promise<MutateResult>;
  createJournal: (title: string) => Promise<MutateResult>;
  checkServer: (serverUrl: string) => Promise<ServerConfig>;
  login: (serverUrl: string, username: string, password: string) => Promise<MutateResult>;
  logout: () => Promise<void>;
  exportBackup: () => Promise<void>;
}

const QuestlogContext = createContext<QuestlogContextValue | null>(null);

export function QuestlogProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<QuestlogData>(() => demoData());
  const [journalId, setJournalIdState] = useState(() => demoData().lists[0]?.id || '');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<Mode>('demo');
  const [account, setAccount] = useState<Account | null>(null);
  const [config, setConfig] = useState<ServerConfig>({ backend: false, configured: false });
  const [serverUrl, setServerUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState('');

  // Refs mirror the latest values so async callbacks and the refresh
  // interval never act on stale state captured by a closure.
  const stateRef = useRef({ mode, serverUrl, account, busy, journalId });
  stateRef.current = { mode, serverUrl, account, busy, journalId };
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 4300);
  }, []);

  const persist = useCallback((next: QuestlogData) => {
    if (stateRef.current.mode === 'demo') demoStorage.save(next);
  }, []);

  const currentJournal = useCallback(() => data.lists.find((l) => l.id === journalId), [data.lists, journalId]);
  const questsHere = useCallback(() => data.quests.filter((q) => q.list_id === journalId), [data.quests, journalId]);

  const editable = useCallback(
    (quest?: { readonly?: boolean } | null) =>
      !busy && !quest?.readonly && !(mode === 'live' && (offline || !!connectionError)),
    [busy, mode, offline, connectionError]
  );

  const loadLive = useCallback(async () => {
    const { serverUrl: url } = stateRef.current;
    const journals = await api.lists(url);
    const collections = await Promise.all(journals.map((l) => api.quests(url, l.id)));
    const next: QuestlogData = { lists: journals, quests: collections.flat() };
    setData(next);
    setJournalIdState((current) => (next.lists.some((l) => l.id === current) ? current : next.lists[0]?.id || ''));
    setConnectionError('');
    setOffline(false);
  }, []);

  const refresh = useCallback(
    async (notify = false) => {
      if (stateRef.current.busy) return;
      if (stateRef.current.mode === 'demo') {
        if (notify) toast('Your demo journal is saved on this device.');
        return;
      }
      setBusy(true);
      try {
        await loadLive();
        if (notify) toast('Your journal is up to date.');
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : 'Could not reach the server.');
      } finally {
        setBusy(false);
      }
    },
    [loadLive, toast]
  );

  const mutate = useCallback(
    async (operation: () => Promise<void> | void): Promise<MutateResult> => {
      if (stateRef.current.busy) return { ok: false, error: 'Please wait for the current change to finish.' };
      setBusy(true);
      try {
        await operation();
        if (stateRef.current.mode === 'live') {
          try {
            await loadLive();
          } catch {
            setConnectionError('Your change was saved, but the journal could not refresh. Reconnect to see the latest state.');
          }
        }
        return { ok: true };
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          try {
            await loadLive();
          } catch {
            // Ignore; the conflict message below still explains what happened.
          }
        }
        const message = error instanceof Error ? error.message : 'Could not save this change.';
        return { ok: false, error: message };
      } finally {
        setBusy(false);
      }
    },
    [loadLive]
  );

  const toggleQuest = useCallback(
    async (id: string): Promise<MutateResult> => {
      const quest = data.quests.find((q) => q.id === id);
      if (!quest || !editable(quest)) return { ok: false, error: 'This quest cannot be changed right now.' };
      const completed = !quest.completed;
      const result = await mutate(async () => {
        if (stateRef.current.mode === 'live') {
          const acc = stateRef.current.account;
          if (!acc) throw new ApiError('Sign in again to continue.', 401);
          await api.updateQuest(stateRef.current.serverUrl, acc.csrf, id, {
            list_id: quest.list_id,
            etag: quest.etag || '',
            completed,
          });
        } else {
          setData((prev) => {
            const next = {
              ...prev,
              quests: prev.quests.map((q) => (q.id === id ? { ...q, completed } : q)),
            };
            persist(next);
            return next;
          });
        }
      });
      if (result.ok) {
        playTone(completed ? 'complete' : 'reopen');
        toast(completed ? (quest.parent ? 'One step closer. Subquest complete!' : 'Quest complete. A little victory worth celebrating.') : 'Quest reopened. The adventure continues.');
      } else if (result.error) {
        toast(result.error);
      }
      return result;
    },
    [data.quests, editable, mutate, persist, toast]
  );

  const createQuest = useCallback(
    async (payload: QuestInput): Promise<MutateResult> => {
      return mutate(async () => {
        if (stateRef.current.mode === 'live') {
          const acc = stateRef.current.account;
          if (!acc) throw new ApiError('Sign in again to continue.', 401);
          await api.createQuest(stateRef.current.serverUrl, acc.csrf, payload);
        } else {
          const id = Crypto.randomUUID();
          setData((prev) => {
            const next: QuestlogData = {
              ...prev,
              quests: [
                ...prev.quests,
                {
                  id,
                  title: payload.title,
                  description: payload.description || '',
                  kind: payload.kind || 'main',
                  parent: payload.parent ?? null,
                  due: payload.due ?? null,
                  list_id: payload.list_id,
                  completed: false,
                  readonly: false,
                },
              ],
            };
            persist(next);
            return next;
          });
        }
      });
    },
    [mutate, persist]
  );

  const updateQuest = useCallback(
    async (id: string, etag: string, payload: Partial<QuestInput>): Promise<MutateResult> => {
      return mutate(async () => {
        if (stateRef.current.mode === 'live') {
          const acc = stateRef.current.account;
          if (!acc) throw new ApiError('Sign in again to continue.', 401);
          const patch: QuestPatch = { list_id: payload.list_id || '', etag, ...payload };
          await api.updateQuest(stateRef.current.serverUrl, acc.csrf, id, patch);
        } else {
          setData((prev) => {
            const next = {
              ...prev,
              quests: prev.quests.map((q) => (q.id === id ? { ...q, ...payload } : q)),
            };
            persist(next);
            return next;
          });
        }
      });
    },
    [mutate, persist]
  );

  const deleteQuest = useCallback(
    async (id: string, etag: string): Promise<MutateResult> => {
      const quest = data.quests.find((q) => q.id === id);
      if (!quest) return { ok: false, error: 'This quest was removed. Refresh the journal.' };
      if (descendants(data.quests, id).length) {
        return { ok: false, error: "Move or remove the subquests first, so none are lost." };
      }
      return mutate(async () => {
        if (stateRef.current.mode === 'live') {
          const acc = stateRef.current.account;
          if (!acc) throw new ApiError('Sign in again to continue.', 401);
          await api.deleteQuest(stateRef.current.serverUrl, acc.csrf, id, { list_id: quest.list_id, etag });
        } else {
          setData((prev) => {
            const next = { ...prev, quests: prev.quests.filter((q) => q.id !== id) };
            persist(next);
            return next;
          });
        }
      });
    },
    [data.quests, mutate, persist]
  );

  const createJournal = useCallback(
    async (title: string): Promise<MutateResult> => {
      const result = await mutate(async () => {
        if (stateRef.current.mode === 'live') {
          const acc = stateRef.current.account;
          if (!acc) throw new ApiError('Sign in again to continue.', 401);
          const before = new Set(data.lists.map((l) => l.id));
          const journals = await api.createList(stateRef.current.serverUrl, acc.csrf, title);
          setData((prev) => ({ ...prev, lists: journals }));
          const created = journals.find((l) => !before.has(l.id));
          setJournalIdState(created?.id || stateRef.current.journalId);
        } else {
          const id = Crypto.randomUUID();
          setData((prev) => {
            const next = { ...prev, lists: [...prev.lists, { id, title, shared: false, readonly: false }] };
            persist(next);
            return next;
          });
          setJournalIdState(id);
        }
        setFilter('all');
        setSearch('');
      });
      return result;
    },
    [data.lists, mutate, persist]
  );

  const checkServer = useCallback(async (url: string): Promise<ServerConfig> => {
    const result = await api.config(url);
    return result;
  }, []);

  const login = useCallback(
    async (url: string, username: string, password: string): Promise<MutateResult> => {
      try {
        const cfg = await api.config(url);
        if (!cfg.configured) {
          return { ok: false, error: 'This server has no Nextcloud connection configured yet.' };
        }
        const acc = await api.login(url, username, password);
        await serverUrlStorage.save(url);
        setServerUrl(url);
        setConfig(cfg);
        setAccount(acc);
        setMode('live');
        setData({ lists: acc.lists, quests: [] });
        setJournalIdState(acc.lists[0]?.id || '');
        stateRef.current = { ...stateRef.current, mode: 'live', serverUrl: url, account: acc };
        await loadLive();
        setFilter('all');
        setSearch('');
        toast('Your Nextcloud journals are ready.');
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not sign in.';
        return { ok: false, error: message };
      }
    },
    [loadLive, toast]
  );

  const logout = useCallback(async () => {
    const acc = stateRef.current.account;
    try {
      if (acc) await api.logout(stateRef.current.serverUrl, acc.csrf);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        toast(error instanceof Error ? error.message : 'Could not sign out.');
        return;
      }
    }
    setAccount(null);
    setMode('demo');
    const stored = (await demoStorage.load<QuestlogData>()) || demoData();
    setData(stored);
    setJournalIdState(stored.lists[0]?.id || '');
    setConnectionError('');
    setFilter('all');
    toast('Signed out of Nextcloud.');
  }, [toast]);

  const exportBackup = useCallback(async () => {
    const payload = JSON.stringify({ format: 'questlog-v1', exported_at: new Date().toISOString(), ...data }, null, 2);
    const file = new File(Paths.cache, 'questlog-backup.json');
    file.create({ overwrite: true });
    file.write(payload);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export your Questlog backup' });
    }
    toast('Your journal backup is ready.');
  }, [data, toast]);

  const toggleCollapsed = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Restore the demo journal and (if a server was previously connected) the
  // live session, mirroring the web app's startup sequence.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedDemo = await demoStorage.load<QuestlogData>();
      if (storedDemo && !cancelled) {
        setData(storedDemo);
        setJournalIdState(storedDemo.lists[0]?.id || '');
      } else if (!cancelled) {
        setJournalIdState((prev) => prev || demoData().lists[0]?.id || '');
      }
      const storedUrl = await serverUrlStorage.load();
      if (!storedUrl || cancelled) return;
      setServerUrl(storedUrl);
      stateRef.current = { ...stateRef.current, serverUrl: storedUrl };
      try {
        const cfg = await api.config(storedUrl);
        if (cancelled) return;
        setConfig(cfg);
        if (!cfg.configured) return;
        const acc = await api.session(storedUrl);
        if (cancelled) return;
        setAccount(acc);
        setMode('live');
        setData({ lists: acc.lists, quests: [] });
        setJournalIdState(acc.lists[0]?.id || '');
        stateRef.current = { ...stateRef.current, mode: 'live', account: acc };
        await loadLive();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return;
        if (!cancelled) setConnectionError(error instanceof Error ? error.message : 'Could not reach the server.');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Network connectivity, matching the web app's online/offline handling.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const nowOffline = state.isConnected === false;
      setOffline(nowOffline);
      if (!nowOffline && stateRef.current.mode === 'live') refresh();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic refresh, matching the web app's 20 second interval; it pauses
  // while the app is backgrounded.
  useEffect(() => {
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') refresh();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const setJournalId = useCallback((id: string) => {
    setJournalIdState(id);
    setSearch('');
  }, []);

  const value = useMemo<QuestlogContextValue>(
    () => ({
      data,
      journalId,
      filter,
      search,
      mode,
      account,
      config,
      serverUrl,
      busy,
      offline,
      connectionError,
      collapsed,
      toastMessage,
      currentJournal,
      questsHere,
      editable,
      setFilter,
      setSearch,
      setJournalId,
      toggleCollapsed,
      toast,
      refresh,
      toggleQuest,
      createQuest,
      updateQuest,
      deleteQuest,
      createJournal,
      checkServer,
      login,
      logout,
      exportBackup,
    }),
    [
      data,
      journalId,
      filter,
      search,
      mode,
      account,
      config,
      serverUrl,
      busy,
      offline,
      connectionError,
      collapsed,
      toastMessage,
      currentJournal,
      questsHere,
      editable,
      setJournalId,
      toggleCollapsed,
      toast,
      refresh,
      toggleQuest,
      createQuest,
      updateQuest,
      deleteQuest,
      createJournal,
      checkServer,
      login,
      logout,
      exportBackup,
    ]
  );

  return <QuestlogContext.Provider value={value}>{children}</QuestlogContext.Provider>;
}

export function useQuestlog(): QuestlogContextValue {
  const context = useContext(QuestlogContext);
  if (!context) throw new Error('useQuestlog must be used within a QuestlogProvider');
  return context;
}
