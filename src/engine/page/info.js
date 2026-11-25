// What something is about, worked out from what's in it, for lists: its
// title, and the day of the event (an invitation's).

const textOf = (value) => (typeof value === 'string' ? value.trim() : '');

export function infoOf(saved) {
  if (saved.kind === 'gift') {
    const heading = saved.elements.find(({ type }) => type === 'heading');
    return { title: textOf(heading?.props.text).split('\n')[0] || 'Untitled gift' };
  }
  const props = (...types) => saved.chapters.find(({ type }) => types.includes(type))?.props;
  const hero = props('hero', 'gardenHero');
  const couple = props('couple');
  const names = [textOf(hero?.name1), textOf(hero?.name2)].filter(Boolean).join(' & ');
  const day = textOf(couple?.date);
  return {
    title: names || textOf(couple?.names) || 'Untitled invitation',
    eventDay: /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : undefined,
  };
}
