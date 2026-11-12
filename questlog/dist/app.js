import {demoData, descendants, progress, roots} from './model.js';

const paths = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  sword: '<path d="m14 3 7-1-1 7L9 20l-5-5Z"/><path d="m3 13 8 8M4 20l-2 2M14 3l6 6"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
  book: '<path d="M4 3h13a3 3 0 0 1 3 3v15H6a3 3 0 0 1-3-3V5a2 2 0 0 1 1-2Z"/><path d="M3 17h17M8 7h7M8 11h5"/>',
  flag: '<path d="M5 22V3c5-5 9 5 15 0v11c-6 5-10-5-15 0"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow: '<path d="M4 12h16m-5-5 5 5-5 5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',
  leaf: '<path d="M20 3C7 1 1 8 6 17c9 5 16-1 14-14ZM3 21 16 8"/>',
  settings: '<circle cx="12" cy="12" r="4"/><path d="m10 2-.5 3-2 1-3-.5-2 3 2 2v3l-2 2 2 3 3-.5 2 1 .5 3h4l.5-3 2-1 3 .5 2-3-2-2v-3l2-2-2-3-3 .5-2-1-.5-3Z"/>',
  refresh: '<path d="M20 7a9 9 0 1 0 1 8M20 2v6h-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  edit: '<path d="m16 3 5 5L8 21H3v-5Zm-2 2 5 5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 1-10 7 7 0 0 1 13 4 3 3 0 0 1-1 6Z"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  shield: '<path d="m12 2 8 3v7c0 6-8 10-8 10S4 18 4 12V5Z"/><path d="m8 11 3 3 5-5"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const storage = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { toast('Your browser could not save this journal. Export a backup in Settings.'); } }
};
let data = storage.get('questlog-demo-v1') || demoData();
let journalId = data.lists[0]?.id || '';
let filter = 'all';
let search = '';
let mode = 'demo';
let account = null;
let config = {backend: false, configured: false};
let busy = false;
let offline = !navigator.onLine;
let connectionError = '';
let collapsed = new Set();
let mobileMenu = false;
let toastTimer;
const dialog = document.querySelector('#dialog');

function toast(message) {
  const node = document.querySelector('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('visible'), 4300);
}

function currentJournal() { return data.lists.find(l => l.id === journalId); }
function questsHere() { return data.quests.filter(q => q.list_id === journalId); }
function editable(q) { return !busy && !q?.readonly && !(mode === 'live' && (offline || connectionError)); }
function persist() { if (mode === 'demo') storage.set('questlog-demo-v1', data); }

function dueLabel(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const difference = Math.round((date - today) / 86400000);
  if (difference === 0) return 'Today';
  if (difference === 1) return 'Tomorrow';
  if (difference === -1) return 'Yesterday';
  return date.toLocaleDateString(undefined, {day: 'numeric', month: 'short'});
}

function dueHTML(quest) {
  if (!quest.due) return '';
  const overdue = new Date(`${quest.due}T23:59:59`) < new Date() && !quest.completed;
  return `<span class="due ${overdue ? 'overdue' : ''}">${icon('calendar')}${esc(dueLabel(quest.due))}</span>`;
}

function checkbox(q) {
  return `<button class="check ${q.completed ? 'checked' : ''}" data-action="toggle" data-id="${esc(q.id)}" role="checkbox" aria-checked="${q.completed}" aria-label="${esc((q.completed ? 'Reopen ' : 'Complete ') + q.title)}" ${editable(q) ? '' : 'disabled'}>${q.completed ? icon('check') : ''}</button>`;
}

function subquestHTML(quest, all, depth = 0, seen = new Set()) {
  if (seen.has(quest.id)) return '';
  const next = new Set([...seen, quest.id]);
  return `<div class="subquest ${quest.completed ? 'completed' : ''} ${depth ? 'nested' : ''}" style="--depth:${Math.min(depth, 4)}">
    ${checkbox(quest)}<button class="sub-title" data-action="edit" data-id="${esc(quest.id)}">${esc(quest.title)}</button>
    <span class="sub-actions"><button data-action="add-sub" data-id="${esc(quest.id)}" aria-label="${esc('Add subquest to ' + quest.title)}" title="Add a nested subquest" ${editable(quest) ? '' : 'disabled'}>${icon('plus')}</button></span>
  </div>${all.filter(q => q.parent === quest.id).map(q => subquestHTML(q, all, depth + 1, next)).join('')}`;
}

function cardHTML(quest, all) {
  const p = progress(all, quest.id);
  const isCollapsed = collapsed.has(quest.id);
  const label = quest.kind === 'main' ? 'MAIN QUEST' : 'SIDE QUEST';
  return `<article class="quest-card ${quest.kind} ${quest.completed ? 'is-complete' : ''}">
    <div class="card-top"><div class="card-kind">${icon(quest.kind === 'main' ? 'sword' : 'spark')}${label}
      ${quest.recurring ? '<span class="read-only">Recurring · view only</span>' : ''}
      <div class="card-menu"><button data-action="edit" data-id="${esc(quest.id)}" aria-label="${esc('Edit ' + quest.title)}" title="Edit quest">${icon('edit')}</button>
      ${p.total ? `<button data-action="collapse" data-id="${esc(quest.id)}" aria-expanded="${!isCollapsed}" aria-label="${esc((isCollapsed ? 'Expand ' : 'Collapse ') + quest.title)}">${icon(isCollapsed ? 'chevron' : 'down')}</button>` : ''}</div></div>
      <div class="quest-title-row">${checkbox(quest)}<button class="quest-title" data-action="edit" data-id="${esc(quest.id)}">${esc(quest.title)}</button></div>
      ${quest.description ? `<p class="quest-description">${esc(quest.description)}</p>` : ''}
    </div>
    ${!isCollapsed && p.total ? `<div class="subquests">${all.filter(q => q.parent === quest.id).map(q => subquestHTML(q, all, 0, new Set([quest.id]))).join('')}</div>` : ''}
    ${!isCollapsed && editable(quest) ? `<button class="add-subquest" data-action="add-sub" data-id="${esc(quest.id)}">${icon('plus')} Add subquest</button>` : ''}
    ${p.total ? `<div class="card-progress"><div class="progress-track" role="progressbar" aria-label="Subquests completed" aria-valuenow="${p.done}" aria-valuemin="0" aria-valuemax="${p.total}"><div class="progress-fill" style="width:${p.percent}%"></div></div></div>` : ''}
    <div class="card-footer"><span class="objective-count">${icon(quest.completed ? 'circleCheck' : 'flag')}${p.total ? `${p.done} of ${p.total} subquests` : quest.completed ? 'Quest completed' : 'A small adventure'}</span>${quest.readonly ? '<span class="mini-tag">View only</span>' : ''}${dueHTML(quest)}</div>
  </article>`;
}

function boardHTML() {
  const all = questsHere();
  const query = search.trim().toLowerCase();
  let visible = roots(all).filter(q => filter === 'completed' ? q.completed : !q.completed);
  if (filter === 'main' || filter === 'side') visible = visible.filter(q => q.kind === filter);
  if (query) visible = visible.filter(q => [q, ...descendants(all, q.id)].some(c => `${c.title} ${c.description}`.toLowerCase().includes(query)));
  if (!visible.length) {
    const title = query ? 'No quests found' : filter === 'completed' ? 'Your story is still unfolding' : 'A new adventure awaits';
    const body = query ? 'Try another word, or explore a different journal.' : filter === 'completed' ? 'Completed quests will find their home here.' : 'Start with something meaningful. Every great quest begins with a small step.';
    return `<div class="empty">${icon('compass')}<h3>${title}</h3><p>${body}</p>${filter !== 'completed' && !query ? '<button class="primary" data-action="new">Begin a quest</button>' : ''}</div>`;
  }
  const column = kind => {
    const items = visible.filter(q => q.kind === kind);
    const title = kind === 'main' ? 'The bigger picture' : 'Little adventures';
    return `<section class="quest-column" aria-label="${kind === 'main' ? 'Main quests' : 'Side quests'}"><div class="column-heading">${icon(kind === 'main' ? 'sword' : 'spark')}${title}<span class="line"></span></div>${items.map(q => cardHTML(q, all)).join('')}${filter !== 'completed' && editable(currentJournal()) ? `<button class="new-card" data-action="new" data-kind="${kind}">${icon('plus')} Add a ${kind} quest</button>` : ''}</section>`;
  };
  const kinds = filter === 'main' ? ['main'] : filter === 'side' ? ['side'] : ['main', 'side'];
  return `<div class="quest-grid" ${kinds.length === 1 ? 'style="grid-template-columns:1fr"' : ''}>${kinds.map(column).join('')}</div>`;
}

function renderBoard() { document.querySelector('#board').innerHTML = boardHTML(); }

function render() {
  const journal = currentJournal();
  const all = questsHere();
  const top = roots(all);
  const active = top.filter(q => !q.completed);
  const cleared = all.filter(q => q.completed);
  const finished = top.filter(q => q.completed);
  const percentage = all.length ? Math.round(cleared.length / all.length * 100) : 0;
  const counts = {all: active.length, main: active.filter(q => q.kind === 'main').length, side: active.filter(q => q.kind === 'side').length, completed: finished.length};
  const sections = [['all', 'Your questlog', 'book'], ['main', 'Main quests', 'sword'], ['side', 'Side quests', 'spark'], ['completed', 'Completed', 'circleCheck']];
  const status = mode === 'demo' ? 'Local demo' : offline ? 'Offline · view only' : connectionError ? 'Connection paused' : 'Connected to Nextcloud';
  const userName = account?.username || 'Adventurer';
  document.querySelector('#app').innerHTML = `<div class="shell ${mobileMenu ? 'menu-open' : ''}">
    <button class="overlay" data-action="menu" aria-label="Close navigation"></button>
    <aside class="sidebar"><div class="brand"><img src="/icon.svg" alt=""><div><div class="brand-name">Questlog</div><small>THE EVERYDAY ADVENTURE</small></div></div>
      <nav aria-label="Main navigation"><div class="nav-label">YOUR JOURNEY</div>${sections.map(([key, title, symbol]) => `<button class="nav-item ${filter === key ? 'active' : ''}" data-action="filter" data-value="${key}" ${filter === key ? 'aria-current="page"' : ''}>${icon(symbol)}${title}<span class="count">${counts[key]}</span></button>`).join('')}
      <div class="nav-divider"></div><div class="nav-label">YOUR JOURNALS</div>${data.lists.map(l => `<button class="nav-item ${l.id === journalId ? 'active' : ''}" data-action="journal" data-id="${esc(l.id)}"><span class="journal-dot ${l.shared ? '' : 'personal'}"></span><span>${esc(l.title)}</span>${l.readonly ? icon('shield') : ''}</button>`).join('')}<button class="nav-item new-journal" data-action="new-journal">${icon('plus')} New journal</button></nav>
      <div class="sidebar-bottom"><div class="sync-box"><div class="sync-heading"><span class="status-dot ${mode === 'live' && !offline && !connectionError ? 'live' : ''}"></span>${status}</div><p>${mode === 'demo' ? 'Sample quests, saved on this device.<br>Your next adventure starts here.' : 'Your journals, together.<br>Changes sync across your devices.'}</p><button data-action="connect">${mode === 'demo' ? 'Connect your world' : 'Connection settings'}${icon('arrow')}</button></div><div class="profile"><div class="avatar">${esc(userName.charAt(0).toUpperCase())}</div><div><div class="name">${esc(userName)}</div><div class="subtitle">${mode === 'demo' ? 'One quest at a time' : 'Your Nextcloud account'}</div></div><button data-action="settings" aria-label="Settings">${icon('settings')}</button></div></div>
    </aside>
    <div class="workspace"><header class="topbar"><button class="mobile-menu" data-action="menu" aria-label="Open navigation">${icon('menu')}</button><div class="breadcrumb">${icon('book')}<span>Your journals</span>${icon('chevron')}<span>${esc(journal?.title || 'Start a journal')}</span></div><div class="right"><span class="top-date">${new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})}</span><button class="round-button" data-action="refresh" aria-label="Refresh journal" title="Refresh journal">${icon('refresh')}</button><button class="round-button" data-action="settings" aria-label="Journal settings">${icon('settings')}</button></div></header>
    <main class="content"><div class="intro"><div><div class="eyebrow">${icon('spark')} A LITTLE PROGRESS, EVERY DAY</div><h1>Your everyday adventure.</h1><p>Big dreams. Small steps. A few worthwhile detours.</p></div><button class="primary" data-action="new" ${journal && editable(journal) ? '' : 'disabled'}>${icon('plus')}<span>New quest</span></button></div>
      <div class="hero"><div class="hero-mark">${icon('compass')}</div><div><h2>Every small step counts.</h2><p>You don't need to finish the whole journey today.<br>Just take the next step.</p></div><div class="hero-progress"><div class="progress-caption"><span>Your journal progress</span><strong>${percentage}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${percentage}%"></div></div><small>${cleared.length} of ${all.length} quests & subquests complete</small></div></div>
      ${mode === 'live' && (offline || connectionError) ? `<div class="notice">${esc(offline ? 'You’re offline. You can view this journal; reconnect to make changes.' : connectionError)}<button data-action="refresh">Try again</button></div>` : ''}
      <div class="stats"><div class="stat"><div class="stat-icon">${icon('sword')}</div><div><div class="stat-value">${String(active.length).padStart(2, '0')}</div><div class="stat-label">Active quests</div></div></div><div class="stat"><div class="stat-icon">${icon('flag')}</div><div><div class="stat-value">${String(all.filter(q => q.parent && q.completed).length).padStart(2, '0')}</div><div class="stat-label">Subquests cleared</div></div></div><div class="stat"><div class="stat-icon">${icon('circleCheck')}</div><div><div class="stat-value">${String(finished.length).padStart(2, '0')}</div><div class="stat-label">Quests completed</div></div></div></div>
      <div class="toolbar"><div class="tabs" role="tablist" aria-label="Quest type">${[['all', 'All quests'], ['main', 'Main quests'], ['side', 'Side quests'], ['completed', 'Completed']].map(([key, title]) => `<button class="tab ${filter === key ? 'active' : ''}" role="tab" aria-selected="${filter === key}" data-action="filter" data-value="${key}">${title}${key === 'all' ? `<small>${counts.all}</small>` : ''}</button>`).join('')}</div><label class="search">${icon('search')}<input id="search" type="search" value="${esc(search)}" placeholder="Search your quests" aria-label="Search quests"><kbd>/</kbd></label></div>
      <div class="board-heading"><h2>${esc(journal?.title || 'Your first chapter')}</h2><span class="number">${active.length} active</span>${mode === 'demo' && journal?.shared ? '<div class="members" aria-label="Illustrative demo members"><span class="avatar">Y</span><span class="avatar">A</span></div><span class="shared-label">Demo party</span>' : '<span style="margin-left:auto"></span>'}${mode === 'demo' ? '<span class="local-badge">DEMO</span>' : ''}${journal ? `<button class="text-button" data-action="share">${icon('users')} Sharing</button>` : ''}</div>
      <div id="board">${boardHTML()}</div><div class="footnote">The journey is better, one quest at a time.</div>
    </main></div></div>`;
}

function openDialog(title, body) {
  dialog.innerHTML = `<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button class="close" data-action="close" aria-label="Close dialog">${icon('close')}</button></div><div class="dialog-body">${body}</div>`;
  if (!dialog.open) dialog.showModal();
}

function questDialog(id = null, parentId = null, kind = 'main') {
  const all = questsHere();
  const existing = all.find(q => q.id === id);
  const parentQuest = all.find(q => q.id === parentId);
  if (!currentJournal()) return journalDialog();
  const quest = existing || {title: '', description: '', kind: parentQuest?.kind || kind, parent: parentId, due: null};
  const excluded = new Set(existing ? [existing.id, ...descendants(all, existing.id).map(q => q.id)] : []);
  const options = all.filter(q => !excluded.has(q.id) && !q.readonly);
  const canEdit = editable(existing || currentJournal());
  openDialog(existing ? 'A chapter in your journey' : parentId ? 'One step closer' : 'Begin a new quest', `<p>${parentId ? `A subquest for “${esc(parentQuest.title)}”.` : 'Give your next adventure a name. The small ones count, too.'}</p>
    <form id="quest-form" data-id="${esc(id || '')}" data-etag="${esc(existing?.etag || '')}"><label for="quest-title">Quest name</label><input id="quest-title" name="title" placeholder="What will your next adventure be?" value="${esc(quest.title)}" required autofocus ${canEdit ? '' : 'disabled'}>
    <label for="quest-description">A little more detail <span class="help-line">(optional)</span></label><textarea id="quest-description" name="description" placeholder="A reason to begin, or a reminder for later…" ${canEdit ? '' : 'disabled'}>${esc(quest.description)}</textarea>
    <label>Choose your path</label><div class="pill-choice"><label><input name="kind" type="radio" value="main" ${quest.kind === 'main' ? 'checked' : ''} ${canEdit ? '' : 'disabled'}>${icon('sword')} Main quest</label><label><input name="kind" type="radio" value="side" ${quest.kind === 'side' ? 'checked' : ''} ${canEdit ? '' : 'disabled'}>${icon('spark')} Side quest</label></div>
    <div class="form-row"><div><label for="quest-parent">Part of a bigger quest</label><select id="quest-parent" name="parent" ${canEdit ? '' : 'disabled'}><option value="">An adventure of its own</option>${options.map(q => `<option value="${esc(q.id)}" ${q.id === quest.parent ? 'selected' : ''}>${esc(q.title)}</option>`).join('')}</select></div><div><label for="quest-due">Aiming for <span class="help-line">(optional)</span></label><input id="quest-due" name="due" type="date" value="${esc(quest.due || '')}" ${canEdit ? '' : 'disabled'}></div></div>
    ${existing?.recurring ? '<p class="help-line">This quest repeats. Edit it in Nextcloud Tasks to keep its recurrence rules intact.</p>' : !canEdit ? '<p class="help-line">This quest is currently view only.</p>' : ''}
    <div class="form-error" role="alert"></div><div class="dialog-actions">${existing && canEdit ? '<button class="danger" type="button" data-action="delete" data-id="' + esc(id) + '">Remove quest</button>' : ''}<button type="button" class="secondary" data-action="close">${canEdit ? 'Cancel' : 'Close'}</button>${canEdit ? `<button type="submit" class="primary">${icon('plus')}${existing ? 'Save changes' : 'Add quest'}</button>` : ''}</div></form>`);
}

function journalDialog() {
  openDialog('A new chapter', '<p>A journal gathers quests for one part of your life. You can share a Nextcloud journal with your party later.</p><form id="journal-form"><label for="journal-title">Journal name</label><input id="journal-title" name="title" placeholder="Our next great adventure" required autofocus><div class="form-error" role="alert"></div><div class="dialog-actions"><button class="secondary" type="button" data-action="close">Cancel</button><button class="primary" type="submit">Create journal</button></div></form>');
}

function connectionDialog() {
  if (mode === 'live') {
    openDialog('Your connected world', `<div class="connection-card"><h3>${icon('cloud')} Connected to Nextcloud</h3><p>Signed in as ${esc(account.username)}. Changes refresh every 20 seconds and when you return to the app. Each person signs in with their own account.</p></div><p>Questlog uses your Nextcloud permissions for shared journals. Your app password stays on your Questlog server for this session.</p><div class="dialog-actions"><button class="secondary" data-action="logout">Sign out</button><button class="primary" data-action="close">Back to the adventure</button></div>`);
    return;
  }
  if (!config.backend || !config.configured) {
    openDialog('Bring your party together', `<div class="connection-card"><h3>${icon('cloud')} Your quests, on Nextcloud</h3><p>Use the self-hosted edition to synchronize your journals and invite other people through Nextcloud.</p></div><p>${config.backend ? 'Set your Nextcloud server address in the Questlog server configuration, then reload this page.' : 'This preview saves changes on this device. The downloadable app includes a Python server and Docker setup for connecting to your own Nextcloud.'}</p><p>Everyone signs in with their own Nextcloud account. Main quests and nested subquests stay together in shared journals.</p><a class="primary download-link" href="/questlog-source.zip" download>${icon('download')} Download the self-hosted app</a><div class="help-line">The setup guide is included. Connecting never uploads these sample quests.</div>`);
    return;
  }
  openDialog('Connect your world', `<p>Sign in to ${esc(new URL(config.nextcloud_url).hostname)} with your Nextcloud username and an app password from Settings → Security. Sample quests stay in the demo.</p><form id="login-form"><label for="username">Nextcloud username</label><input id="username" name="username" autocomplete="username" required autofocus><label for="password">Nextcloud app password</label><input id="password" name="password" type="password" autocomplete="current-password" required><div class="form-error" role="alert"></div><div class="dialog-actions"><button class="secondary" type="button" data-action="close">Cancel</button><button class="primary" type="submit">Connect Nextcloud</button></div></form>`);
}

function shareDialog() {
  const title = esc(currentJournal()?.title || 'Your journal');
  openDialog('Better with a party', `<div class="share-illustration"><span class="avatar">Y</span>${icon('spark')}<span class="avatar">+</span></div><p>${mode === 'demo' ? `“${title}” is a local demo journal. Its party members are illustrative; this preview does not share data with anyone.` : `Share “${title}” from Nextcloud Calendar with the people in your party. Grant edit access so they can add and complete quests, or read-only access to let them follow along.`}</p><div class="connection-card"><h3>${icon('shield')} One journal, individual accounts</h3><p>${mode === 'demo' ? 'In the self-hosted app, everyone signs in with their own Nextcloud account and sees the journals shared with them.' : 'People with access sign in to this same Questlog app using their own Nextcloud username and app password. Shared journals appear automatically. All changes stay in Nextcloud.'}</p></div>${mode === 'live' ? `<a class="primary download-link" href="${esc(config.nextcloud_url)}/index.php/apps/calendar/" target="_blank" rel="noopener noreferrer">${icon('users')} Manage sharing in Nextcloud</a>` : '<button class="primary" data-action="connect">Connect your world</button>'}`);
}

function settingsDialog() {
  openDialog('Make yourself at home', `<p>A quiet place for the things you want to do.</p><div class="connection-card"><h3>${icon('cloud')} ${mode === 'demo' ? 'Exploring the demo' : 'Nextcloud connected'}</h3><p>${mode === 'demo' ? 'These sample journals are stored only in this browser. To sync across devices and share lists, connect the self-hosted app to Nextcloud.' : 'Your Nextcloud server stores your quests. This app checks for updates every 20 seconds. Sessions last eight hours; signing out clears the session.'}</p></div><button class="secondary wide" data-action="connect">${icon('cloud')} ${mode === 'demo' ? 'Connection options' : 'Manage connection'}</button><div style="height:10px"></div><button class="secondary wide" data-action="export">${icon('download')} Export a JSON backup</button><div style="height:10px"></div><a class="secondary wide" href="/questlog-source.zip" download style="text-decoration:none">${icon('download')} Download self-hosted source</a><p class="help-line" style="margin-top:16px">Main quests are the bigger picture. Side quests are worthwhile detours. Add as many nested subquests as your journey needs.</p>`);
}

async function api(path, method = 'GET', body) {
  const response = await fetch(path, {method, credentials: 'same-origin', cache: 'no-store', headers: {
    ...(body ? {'Content-Type': 'application/json'} : {}), ...(account ? {'X-CSRF-Token': account.csrf} : {})
  }, ...(body ? {body: JSON.stringify(body)} : {})});
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(typeof result.detail === 'string' ? result.detail : 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return result;
}

async function loadLive() {
  const journals = await api('/api/lists');
  const collections = await Promise.all(journals.map(l => api(`/api/quests?list_id=${encodeURIComponent(l.id)}`)));
  data = {lists: journals, quests: collections.flat()};
  if (!data.lists.some(l => l.id === journalId)) journalId = data.lists[0]?.id || '';
  connectionError = '';
  offline = false;
}

async function refresh(notify = false) {
  if (busy) return;
  if (mode === 'demo') { if (notify) toast('Your demo journal is saved on this device.'); return; }
  busy = true;
  try { await loadLive(); if (notify) toast('Your journal is up to date.'); }
  catch (error) { connectionError = error.message; }
  finally { busy = false; render(); }
}

async function mutate(operation) {
  if (busy) return false;
  busy = true;
  try {
    await operation();
    if (mode === 'live') {
      try { await loadLive(); }
      catch { connectionError = 'Your change was saved, but the journal could not refresh. Reconnect to see the latest state.'; }
    } else persist();
    return true;
  } catch (error) {
    if (error.status === 409) {
      try { await loadLive(); } catch {}
    }
    const target = dialog.open ? dialog.querySelector('.form-error') : null;
    if (target) target.textContent = error.message; else toast(error.message || 'Could not save this change.');
    return false;
  } finally { busy = false; render(); }
}

async function handleAction(button) {
  const action = button.dataset.action;
  const id = button.dataset.id;
  const quest = questsHere().find(q => q.id === id);
  if (action === 'close') return dialog.close();
  if (action === 'menu') { mobileMenu = !mobileMenu; render(); }
  if (action === 'filter') { filter = button.dataset.value; mobileMenu = false; render(); }
  if (action === 'journal') { journalId = id; search = ''; mobileMenu = false; render(); }
  if (action === 'new') questDialog(null, null, button.dataset.kind || (filter === 'side' ? 'side' : 'main'));
  if (action === 'edit') questDialog(id);
  if (action === 'add-sub') questDialog(null, id);
  if (action === 'collapse') { collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id); renderBoard(); }
  if (action === 'new-journal') journalDialog();
  if (action === 'connect') connectionDialog();
  if (action === 'share') shareDialog();
  if (action === 'settings') settingsDialog();
  if (action === 'refresh') await refresh(true);
  if (action === 'toggle' && quest && editable(quest)) {
    const completed = !quest.completed;
    const saved = await mutate(async () => {
      if (mode === 'live') await api(`/api/quests/${encodeURIComponent(id)}`, 'PATCH', {list_id: quest.list_id, etag: quest.etag, completed});
      else quest.completed = completed;
    });
    if (saved) toast(completed ? (quest.parent ? 'One step closer. Subquest complete!' : 'Quest complete. A little victory worth celebrating.') : 'Quest reopened. The adventure continues.');
  }
  if (action === 'delete' && quest) {
    if (descendants(questsHere(), id).length) { dialog.querySelector('.form-error').textContent = 'Move or remove the subquests first, so none are lost.'; return; }
    openDialog('Remove this quest?', `<p>Remove “${esc(quest.title)}” from this journal? ${mode === 'live' ? 'This also removes it from Nextcloud for everyone with access.' : 'This cannot be undone.'}</p><div class="form-error" role="alert"></div><div class="dialog-actions"><button class="secondary" data-action="edit" data-id="${esc(id)}">Keep quest</button><button class="primary" data-action="confirm-delete" data-id="${esc(id)}">Remove quest</button></div>`);
  }
  if (action === 'confirm-delete' && quest) {
    const saved = await mutate(async () => {
      if (mode === 'live') await api(`/api/quests/${encodeURIComponent(id)}`, 'DELETE', {list_id: quest.list_id, etag: quest.etag});
      else data.quests = data.quests.filter(q => q.id !== id);
    });
    if (saved) { dialog.close(); toast('Quest removed.'); }
  }
  if (action === 'logout') {
    try { await api('/api/logout', 'POST', {}); }
    catch (error) { if (error.status !== 401) { toast(error.message); return; } }
    account = null; mode = 'demo'; data = storage.get('questlog-demo-v1') || demoData(); journalId = data.lists[0]?.id || '';
    connectionError = ''; filter = 'all'; dialog.close(); render(); toast('Signed out of Nextcloud.');
  }
  if (action === 'export') {
    const blob = new Blob([JSON.stringify({format: 'questlog-v1', exported_at: new Date().toISOString(), ...data}, null, 2)], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'questlog-backup.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    toast('Your journal backup is ready.');
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (button && !button.disabled) handleAction(button).catch(error => toast(error.message));
});
document.addEventListener('input', event => {
  if (event.target.id === 'search') { search = event.target.value; renderBoard(); }
});
document.addEventListener('keydown', event => {
  if (event.key === '/' && !dialog.open && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    event.preventDefault(); document.querySelector('#search').focus();
  }
});
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  const values = Object.fromEntries(new FormData(form));
  const submit = form.querySelector('[type="submit"]');
  if (busy) return;
  if (submit) submit.disabled = true;
  try {
    if (form.id === 'quest-form') {
      if (!values.title.trim()) { form.querySelector('.form-error').textContent = 'Give your quest a name.'; return; }
      const id = form.dataset.id;
      const payload = {title: values.title.trim(), description: values.description.trim(), kind: values.kind,
        parent: values.parent || null, due: values.due || null, list_id: journalId};
      if (payload.parent) payload.kind = questsHere().find(q => q.id === payload.parent)?.kind || payload.kind;
      const saved = await mutate(async () => {
        if (mode === 'live') await api(id ? `/api/quests/${encodeURIComponent(id)}` : '/api/quests', id ? 'PATCH' : 'POST', {...payload, ...(id ? {etag: form.dataset.etag} : {})});
        else if (id) Object.assign(data.quests.find(q => q.id === id), payload);
        else data.quests.push({...payload, id: crypto.randomUUID(), completed: false, readonly: false});
      });
      if (saved) { dialog.close(); toast(id ? 'Your quest has been updated.' : 'A new adventure begins.'); }
    }
    if (form.id === 'journal-form') {
      if (!values.title.trim()) return;
      const saved = await mutate(async () => {
        if (mode === 'live') {
          const journals = await api('/api/lists', 'POST', {title: values.title.trim()});
          journalId = journals.find(l => !data.lists.some(old => old.id === l.id))?.id || journalId;
        } else {
          journalId = crypto.randomUUID();
          data.lists.push({id: journalId, title: values.title.trim(), shared: false, readonly: false});
        }
        filter = 'all'; search = '';
      });
      if (saved) { dialog.close(); toast('A new chapter, ready for your quests.'); }
    }
    if (form.id === 'login-form') {
      account = await api('/api/login', 'POST', values);
      await loadLive(); mode = 'live'; filter = 'all'; search = ''; dialog.close(); render(); toast('Your Nextcloud journals are ready.');
    }
  } catch (error) { form.querySelector('.form-error').textContent = error.message; }
  finally { if (submit) submit.disabled = false; }
});

window.addEventListener('online', () => { offline = false; refresh(); });
window.addEventListener('offline', () => { offline = true; render(); });
window.addEventListener('storage', event => {
  if (event.key === 'questlog-demo-v1' && mode === 'demo') {
    data = storage.get('questlog-demo-v1') || data;
    if (!data.lists.some(l => l.id === journalId)) journalId = data.lists[0]?.id || '';
    render();
  }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && !dialog.open) refresh(); });
setInterval(() => {
  if (!document.hidden && !dialog.open && document.activeElement?.id !== 'search') refresh();
}, 20000);

render();
async function initialize() {
  try {
    const response = await fetch('/api/config', {cache: 'no-store'});
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) config = await response.json();
    if (config.configured) {
      try {
        account = await api('/api/session');
        mode = 'live'; data = {lists: account.lists, quests: []}; journalId = account.lists[0]?.id || '';
        await loadLive(); render();
      }
      catch (error) { if (error.status !== 401) { connectionError = error.message; render(); } }
    }
  } catch {}
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}
initialize();
