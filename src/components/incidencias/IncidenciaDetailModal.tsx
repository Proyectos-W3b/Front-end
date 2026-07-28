import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { ExternalLink, MessageSquare, Paperclip, Send, Trash2, Users } from 'lucide-react';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useArchivosIncidencia } from '../../hooks/useArchivosIncidencia';
import { useAsignacionesIncidencia } from '../../hooks/useAsignacionesIncidencia';
import { useComentarios } from '../../hooks/useComentarios';
import { useTrabajadores } from '../../hooks/useTrabajadores';
import { inferirTipoArchivo } from '../../lib/fileType';
import { uploadsApi } from '../../services/api.service';
import { CreateArchivoIncidenciaData } from '../../services/archivos-incidencia.service';
import type { Incidencia } from '../../types';

type DetailTab = 'comentarios' | 'archivos' | 'asignados';

const EMPTY_INC_ARC: Omit<CreateArchivoIncidenciaData, 'incidenciaId'> = {
  nombre: '', url: '', tipo: 'documento',
};

export default function IncidenciaDetailModal({
  incidenciaId, incidencia, isAdmin, onClose, onNotifySuccess, onNotifyError, extraHeader,
}: {
  incidenciaId: string | null;
  incidencia: Incidencia | null;
  isAdmin: boolean;
  onClose: () => void;
  onNotifySuccess: (title: string, description?: string) => void;
  onNotifyError: (title: string, description?: string) => void;
  /** Contenido adicional (ej. chip de proyecto/cliente) mostrado junto a los badges de estado. */
  extraHeader?: ReactNode;
}) {
  const open = !!incidenciaId;
  const [tab, setTab] = useState<DetailTab>('comentarios');
  const [newComment, setNewComment] = useState('');
  const [arcForm, setArcForm] = useState(EMPTY_INC_ARC);
  const [subiendoArc, setSubiendoArc] = useState(false);
  const [asignandoId, setAsignandoId] = useState('');

  const comentarios = useComentarios(incidenciaId, open);
  const archivos = useArchivosIncidencia(incidenciaId, open);
  const asignados = useAsignacionesIncidencia(incidenciaId, open);
  const trabajadores = useTrabajadores(open);

  useEffect(() => {
    if (open) {
      setTab('comentarios');
      setNewComment('');
      setArcForm(EMPTY_INC_ARC);
      setAsignandoId('');
    }
  }, [incidenciaId]);

  if (!incidencia) return null;

  const sendComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await comentarios.send.mutateAsync(newComment.trim());
    setNewComment('');
  };

  const handleArcFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoArc(true);
    try {
      const objectPath = await uploadsApi.subirArchivo(file, 'incidencias');
      setArcForm((f) => ({ ...f, url: objectPath, nombre: f.nombre || file.name, tipo: inferirTipoArchivo(file) }));
    } finally {
      setSubiendoArc(false);
    }
  };

  const saveArc = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await archivos.create.mutateAsync(arcForm);
      setArcForm(EMPTY_INC_ARC);
      onNotifySuccess('Archivo adjuntado', 'El archivo quedó vinculado a la incidencia.');
    } catch {
      onNotifyError('No se pudo adjuntar el archivo');
    }
  };

  const asignar = async (e: FormEvent) => {
    e.preventDefault();
    if (!asignandoId) return;
    try {
      await asignados.asignar.mutateAsync(asignandoId);
      setAsignandoId('');
      onNotifySuccess('Trabajador asignado', 'Ya puede ver esta incidencia en su bandeja.');
    } catch {
      onNotifyError('No se pudo asignar el trabajador');
    }
  };

  const loading = comentarios.isLoading || archivos.isLoading || asignados.isLoading;

  return (
    <Modal open={open} onClose={onClose} title={incidencia.titulo} size="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
          <Badge value={incidencia.estado} />
          <Badge value={incidencia.prioridad} />
          {extraHeader}
        </div>
        {incidencia.descripcion && (
          <p className="text-sm text-slate-600">{incidencia.descripcion}</p>
        )}
        <div className="flex gap-1 border-b border-slate-100">
          {(['comentarios', 'archivos', 'asignados'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={[
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800',
              ].join(' ')}
            >
              {t === 'comentarios' && <><MessageSquare className="w-3.5 h-3.5" /> Comentarios {comentarios.data.length > 0 && `(${comentarios.data.length})`}</>}
              {t === 'archivos'    && <><Paperclip className="w-3.5 h-3.5" /> Archivos {archivos.data.length > 0 && `(${archivos.data.length})`}</>}
              {t === 'asignados'   && <><Users className="w-3.5 h-3.5" /> Asignados {asignados.data.length > 0 && `(${asignados.data.length})`}</>}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 text-center py-6">Cargando…</p>
        ) : (
          <>
            {tab === 'comentarios' && (
              <div className="space-y-3">
                {comentarios.data.length === 0
                  ? <p className="text-sm text-slate-400 text-center py-4">Sin comentarios aún</p>
                  : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {comentarios.data.map((c) => (
                        <div key={c.id} className="bg-slate-50 rounded-lg px-3 py-2.5 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800 break-words">{c.contenido}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(c.fechaCreacion).toLocaleString('es')}
                            </p>
                          </div>
                          {isAdmin && (
                            <button onClick={() => comentarios.remove.mutate(c.id)}
                              className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                }
                <form onSubmit={sendComment} className="flex gap-2 pt-1">
                  <input className="input flex-1 text-sm" placeholder="Escribe un comentario…"
                    value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                  <button type="submit" disabled={comentarios.send.isPending || !newComment.trim()}
                    className="btn-primary px-3 py-2 flex items-center gap-1.5 text-sm">
                    <Send className="w-3.5 h-3.5" />
                    {comentarios.send.isPending ? 'Enviando…' : 'Enviar'}
                  </button>
                </form>
              </div>
            )}

            {tab === 'archivos' && (
              <div className="space-y-3">
                {archivos.data.length === 0
                  ? <p className="text-sm text-slate-400 text-center py-4">Sin archivos adjuntos</p>
                  : (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {archivos.data.map((a) => (
                        <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-sm text-slate-800 truncate">{a.nombre}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{a.tipo}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <a href={a.url} target="_blank" rel="noopener noreferrer"
                              className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            {isAdmin && (
                              <button onClick={() => archivos.remove.mutate(a.id)}
                                className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
                <form onSubmit={saveArc} className="space-y-2 pt-1 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Adjuntar archivo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input text-sm" placeholder="Nombre del archivo"
                      value={arcForm.nombre} onChange={(e) => setArcForm({ ...arcForm, nombre: e.target.value })} required />
                    <select className="input text-sm" value={arcForm.tipo}
                      onChange={(e) => setArcForm({ ...arcForm, tipo: e.target.value as CreateArchivoIncidenciaData['tipo'] })}>
                      <option value="documento">Documento</option>
                      <option value="imagen">Imagen</option>
                      <option value="video">Video</option>
                      <option value="hoja_calculo">Hoja de cálculo</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input type="file" className="input flex-1 text-sm" onChange={handleArcFile} disabled={subiendoArc} />
                    <button type="submit" disabled={archivos.create.isPending || subiendoArc || !arcForm.url}
                      className="btn-primary px-3 py-2 text-sm shrink-0">
                      {subiendoArc ? 'Subiendo…' : archivos.create.isPending ? 'Guardando…' : 'Adjuntar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tab === 'asignados' && (
              <div className="space-y-3">
                {asignados.data.length === 0
                  ? <p className="text-sm text-slate-400 text-center py-4">Nadie asignado a esta incidencia</p>
                  : (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {asignados.data.map((a) => (
                        <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {a.trabajador?.fotoUrl ? (
                              <img src={a.trabajador.fotoUrl} alt={a.trabajador.nombre} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {(a.trabajador?.nombre?.[0] ?? '?').toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-slate-800 truncate">{a.trabajador?.nombre ?? 'Trabajador'}</span>
                          </div>
                          {isAdmin && (
                            <button onClick={() => asignados.quitar.mutate(a.id)}
                              className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                }
                {isAdmin && (
                  <form onSubmit={asignar} className="flex gap-2 pt-1 border-t border-slate-100">
                    <select className="input flex-1 text-sm" value={asignandoId}
                      onChange={(e) => setAsignandoId(e.target.value)} required>
                      <option value="">Seleccionar trabajador…</option>
                      {trabajadores.data
                        .filter((t) => !asignados.data.some((a) => a.trabajadorId === t.id))
                        .map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                    <button type="submit" disabled={asignados.asignar.isPending || !asignandoId}
                      className="btn-primary px-3 py-2 text-sm shrink-0">
                      {asignados.asignar.isPending ? 'Asignando…' : 'Asignar'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
