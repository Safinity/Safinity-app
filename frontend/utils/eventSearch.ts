type SearchableEvent = {
  name?: unknown;
  venue_name?: unknown;
  category?: unknown;
  description?: unknown;
  status?: unknown;
};

function normalizeSearchText(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesEventSearch(event: SearchableEvent, query: string) {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return true;
  }

  const searchableText = [
    event.name,
    event.venue_name,
    event.category,
    event.description,
    event.status,
  ]
    .map(normalizeSearchText)
    .join(' ');

  return terms.every(term => searchableText.includes(term));
}
