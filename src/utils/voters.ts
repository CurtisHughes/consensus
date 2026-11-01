/**
 * Summarizes who voted, e.g. "You, Alice, Bob + 2 others". The current user comes first as "You",
 * and voters without a name are only counted.
 */
export function formatVoters(
  authors: string[],
  names: Map<string, string>,
  uid: string,
  max = 3,
): string {
  const named: string[] = [];
  let anonymous = 0;
  for (const author of authors) {
    const name = names.get(author);
    if (author === uid) named.unshift('You');
    else if (name) named.push(name);
    else anonymous += 1;
  }

  const shown = named.slice(0, max);
  const hidden = named.length - shown.length + anonymous;
  if (shown.length === 0) return `${hidden} ${hidden === 1 ? 'person' : 'people'}`;
  if (hidden === 0) return shown.join(', ');
  return `${shown.join(', ')} + ${hidden} ${hidden === 1 ? 'other' : 'others'}`;
}
