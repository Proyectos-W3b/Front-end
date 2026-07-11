const DIACRITICS_REGEX = new RegExp('[̀-ͯ]', 'g');

export function slugify(text: string): string {
  return text
    .normalize('NFD').replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toProjectPath(project: { id: string; nombre: string }): string {
  const shortId = project.id.slice(0, 8);
  const base = slugify(project.nombre) || 'proyecto';
  return `/projects/${base}-${shortId}`;
}

/** Extrae del parámetro de ruta lo necesario para ubicar el proyecto real:
 *  el sufijo corto de 8 hex (slug nuevo) o, si es un link viejo con el UUID
 *  completo, el UUID tal cual. */
export function extractIdMatcher(slugParam: string): string {
  const match = slugParam.match(/-([0-9a-f]{8})$/i);
  return match ? match[1] : slugParam;
}
