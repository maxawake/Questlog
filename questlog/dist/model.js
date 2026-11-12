export function descendants(quests, id) {
  const found = [];
  const visited = new Set([id]);
  const visit = parent => {
    for (const quest of quests.filter(q => q.parent === parent)) {
      if (visited.has(quest.id)) continue;
      visited.add(quest.id);
      found.push(quest);
      visit(quest.id);
    }
  };
  visit(id);
  return found;
}

export function progress(quests, id) {
  const children = descendants(quests, id);
  const done = children.filter(q => q.completed).length;
  return {done, total: children.length, percent: children.length ? Math.round(done / children.length * 100) : 0};
}

export function roots(quests) {
  const ids = new Set(quests.map(q => q.id));
  const result = quests.filter(q => !q.parent || !ids.has(q.parent));
  const reachable = new Set(result.flatMap(q => [q.id, ...descendants(quests, q.id).map(c => c.id)]));
  for (const q of quests) {
    if (!reachable.has(q.id)) {
      result.push(q);
      [q, ...descendants(quests, q.id)].forEach(c => reachable.add(c.id));
    }
  }
  return result;
}

export function demoData() {
  const due = offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const quest = (id, title, kind, parent = null, completed = false, list_id = 'home', description = '', date = null) =>
    ({id, title, kind, parent, completed, list_id, description, due: date, readonly: false});
  return {
    lists: [{id: 'home', title: 'Our little world', shared: true, readonly: false},
      {id: 'personal', title: 'Personal adventures', shared: false, readonly: false}],
    quests: [
      quest('home-1', 'Make a house a home', 'main', null, false, 'home', 'Small steps toward a space that feels like us.', due(5)),
      quest('home-1a', 'Unpack the last moving boxes', 'main', 'home-1', true),
      quest('home-1b', 'Build our little reading corner', 'main', 'home-1'),
      quest('home-1b1', 'Find the perfect reading lamp', 'main', 'home-1b', true),
      quest('home-1b2', 'Pick a very comfortable armchair', 'main', 'home-1b'),
      quest('home-1c', 'Bring home a few plants', 'main', 'home-1'),
      quest('trip', 'Escape to the mountains', 'main', null, false, 'home', 'Fresh air, no notifications, and a very good view.', due(12)),
      quest('trip-a', 'Choose a trail for the weekend', 'main', 'trip', true),
      quest('trip-b', 'Book a cabin for two', 'main', 'trip'),
      quest('trip-c', 'Pack the adventure essentials', 'main', 'trip'),
      quest('recipe', 'Master a new pasta recipe', 'side', null, false, 'home', 'A delicious little detour.', due(1)),
      quest('recipe-a', 'Find a recipe worth trying', 'side', 'recipe', true),
      quest('recipe-b', 'Gather the ingredients', 'side', 'recipe'),
      quest('walk', 'Take the scenic way home', 'side', null, false, 'home', 'Leave a little room for wandering.'),
      quest('finished', 'Find our new favorite coffee spot', 'side', null, true, 'home', 'A very worthwhile expedition.'),
      quest('personal-1', 'Build something of my own', 'main', null, false, 'personal', 'Turn an idea into a small, working reality.'),
      quest('personal-1a', 'Sketch the first version', 'main', 'personal-1', true, 'personal'),
      quest('personal-1b', 'Make time to create', 'main', 'personal-1', false, 'personal')
    ]
  };
}
