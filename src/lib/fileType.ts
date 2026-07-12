/** Tipo usado por ArchivoProyecto/ArchivoIncidencia: documento, imagen, video, hoja_calculo, otro. */
export function inferirTipoArchivo(file: File): string {
  if (file.type.startsWith('image/')) return 'imagen';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.includes('sheet') || file.type.includes('excel') || /\.xlsx?$/i.test(file.name)) return 'hoja_calculo';
  if (file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('document') || /\.(pdf|docx?)$/i.test(file.name)) return 'documento';
  return 'otro';
}
