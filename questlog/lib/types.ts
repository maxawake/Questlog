export type QuestKind = 'main' | 'side';

export type Filter = 'all' | 'main' | 'side' | 'completed';

export type Mode = 'demo' | 'live';

export interface Journal {
  id: string;
  title: string;
  shared: boolean;
  readonly: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  kind: QuestKind;
  parent: string | null;
  completed: boolean;
  due: string | null;
  list_id: string;
  readonly: boolean;
  recurring?: boolean;
  etag?: string;
}

export interface QuestlogData {
  lists: Journal[];
  quests: Quest[];
}

export interface Account {
  username: string;
  csrf: string;
  lists: Journal[];
}

export interface ServerConfig {
  backend: boolean;
  configured: boolean;
  nextcloud_url?: string;
}

export interface QuestInput {
  list_id: string;
  title: string;
  description?: string;
  kind?: QuestKind;
  parent?: string | null;
  due?: string | null;
}

export interface QuestPatch {
  list_id: string;
  etag: string;
  title?: string;
  description?: string;
  kind?: QuestKind;
  parent?: string | null;
  due?: string | null;
  completed?: boolean;
}
