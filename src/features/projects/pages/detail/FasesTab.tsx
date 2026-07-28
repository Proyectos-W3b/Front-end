import { FormEvent, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import PhaseTracker from '../../../../components/ui/PhaseTracker';
import type { Fase } from '../../../../types';
import { useFases } from './hooks/useFases';

export default function FasesTab({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
  const { data: fases, create, cycleEstado, rename, remove, reorder } = useFases(projectId);
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  const openCreate = () => { setNombre(''); setError(''); setOpen(true); };
  const close = () => setOpen(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError('');
    try {
      await create.mutateAsync(nombre.trim());
      close();
    } catch (err: any) { setError(err?.message ?? 'Error al crear fase'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] p-5">
      <PhaseTracker
        fases={fases}
        editable={isAdmin}
        onCycleEstado={(fase: Fase) => cycleEstado.mutate(fase)}
        onRename={(fase: Fase, n: string) => rename.mutate({ fase, nombre: n })}
        onDelete={(fase: Fase) => { if (confirm('¿Eliminar esta fase?')) remove.mutate(fase); }}
        onReorder={(orderedIds: string[]) => reorder.mutate(orderedIds)}
        onAddClick={openCreate}
      />

      <Modal open={open} onClose={close} title="Nueva fase" description="Agrega una etapa al flujo de este proyecto.">
        <form onSubmit={save} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="label">Nombre de la fase *</label>
            <input className="input" placeholder="Ej: Diseño, Desarrollo, QA…" value={nombre}
              onChange={(e) => setNombre(e.target.value)} required autoFocus />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={close}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Creando…' : 'Crear fase'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
