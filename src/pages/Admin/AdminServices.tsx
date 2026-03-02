import { useState, useEffect } from 'react';
import { Clock, Edit2, ToggleLeft, ToggleRight, Plus, X, Scissors, Trash2, Loader2 } from 'lucide-react';
import { getAllServices, createService, updateService, deleteService } from '../../services/services';
import { formatCOP } from '../../data';
import type { Service } from '../../types';

type ActiveService = Service & { active: boolean };

const CATEGORIES: Service['category'][] = [
  'cortes', 'barba', 'tratamientos', 'depilacion', 'masajes', 'cejas',
];

const categoryColors: Record<string, string> = {
  cortes: 'bg-blue-500/15 text-blue-400',
  barba: 'bg-amber-500/15 text-amber-400',
  tratamientos: 'bg-emerald-500/15 text-emerald-400',
  depilacion: 'bg-rose-500/15 text-rose-400',
  masajes: 'bg-cyan-500/15 text-cyan-400',
  cejas: 'bg-violet-500/15 text-violet-400',
};

interface ServiceForm {
  name: string;
  category: Service['category'];
  duration: number;
  price: number;
  description: string;
  popular: boolean;
}

const emptyForm: ServiceForm = {
  name: '',
  category: 'cortes',
  duration: 30,
  price: 20000,
  description: '',
  popular: false,
};

export default function AdminServices() {
  const [list, setList] = useState<ActiveService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ActiveService | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceForm, string>>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllServices()
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string) => {
    const service = list.find((s) => s.id === id);
    if (!service) return;
    const newVal = !service.active;
    setList((prev) => prev.map((s) => s.id === id ? { ...s, active: newVal } : s));
    await updateService(id, { active: newVal });
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (service: ActiveService) => {
    setEditTarget(service);
    setForm({
      name: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
      description: service.description,
      popular: service.popular ?? false,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof ServiceForm, string>> = {};
    if (!form.name.trim()) e.name = 'Nombre requerido';
    if (!form.description.trim()) e.description = 'Descripción requerida';
    if (form.duration < 5) e.duration = 'Duración mínima 5 min';
    if (form.price < 1000) e.price = 'Precio mínimo $1.000';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateService(editTarget.id, form);
        setList((prev) =>
          prev.map((s) =>
            s.id === editTarget.id
              ? { ...s, ...form }
              : s
          )
        );
      } else {
        const newService = await createService({ ...form, active: true });
        setList((prev) => [...prev, { ...newService, active: true }]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteService(deleteId);
    setList((prev) => prev.filter((s) => s.id !== deleteId));
    setDeleteId(null);
  };

  const inputClass = (field: keyof ServiceForm) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-gold/50 transition-colors`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-zinc-500 text-sm">{list.length} servicios configurados</p>
        <button
          onClick={openAdd}
          className="btn-gold px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
        >
          <Plus size={14} />
          Nuevo Servicio
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gold" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Servicio', 'Categoría', 'Duración', 'Precio', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {list.map((service) => (
                  <tr key={service.id} className={`hover:bg-white/2 transition-colors ${!service.active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{service.name}</p>
                            {service.popular && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-gold/15 text-gold rounded-full border border-gold/20 font-semibold">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-600 text-xs mt-0.5 line-clamp-1 max-w-48">{service.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${categoryColors[service.category] || 'text-zinc-400 bg-white/5'}`}>
                        {service.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Clock size={13} />
                        <span>{service.duration} min</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold gold-text">
                      {formatCOP(service.price)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(service.id)}
                        className="flex items-center gap-1.5 text-xs transition-colors"
                      >
                        {service.active
                          ? <><ToggleRight size={20} className="text-green-400" /><span className="text-green-400">Activo</span></>
                          : <><ToggleLeft size={20} className="text-zinc-600" /><span className="text-zinc-600">Inactivo</span></>
                        }
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(service)}
                          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-gold transition-colors px-3 py-1.5 glass rounded-lg border border-white/10 hover:border-gold/30"
                        >
                          <Edit2 size={12} />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteId(service.id)}
                          className="flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors p-1.5 glass rounded-lg border border-white/10 hover:border-red-500/30"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ background: '#1a1a1a' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center">
                  <Scissors size={15} className="text-gold" />
                </div>
                <h2 className="font-semibold text-white">
                  {editTarget ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="text-zinc-400 text-xs mb-1.5 block">Nombre del servicio</label>
                <input
                  className={inputClass('name')}
                  placeholder="Ej: Corte Fade Premium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-zinc-400 text-xs mb-1.5 block">Descripción</label>
                <textarea
                  className={`${inputClass('description')} resize-none`}
                  rows={3}
                  placeholder="Describe el servicio brevemente..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="text-zinc-400 text-xs mb-1.5 block">Categoría</label>
                <select
                  className={`${inputClass('category')} cursor-pointer`}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Service['category'] })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900 capitalize">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 text-xs mb-1.5 block">
                    Duración <span className="text-zinc-600">(minutos)</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    step={5}
                    className={inputClass('duration')}
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  />
                  {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <label className="text-zinc-400 text-xs mb-1.5 block">
                    Precio <span className="text-zinc-600">(COP)</span>
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    className={inputClass('price')}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                  {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 px-4 bg-white/3 border border-white/8 rounded-xl">
                <div>
                  <p className="text-white text-sm">Marcar como popular</p>
                  <p className="text-zinc-600 text-xs">Aparecerá destacado en el sitio</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, popular: !form.popular })}
                  className="transition-colors"
                >
                  {form.popular
                    ? <ToggleRight size={28} className="text-green-400" />
                    : <ToggleLeft size={28} className="text-zinc-600" />
                  }
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/8 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 glass border border-white/10 rounded-xl text-zinc-400 hover:text-white text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="btn-gold px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editTarget ? 'Guardar Cambios' : 'Crear Servicio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative w-full max-w-sm border border-white/10 rounded-2xl shadow-2xl p-6" style={{ background: '#1a1a1a' }}>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h3 className="text-white font-semibold text-center mb-1">Eliminar servicio</h3>
            <p className="text-zinc-500 text-sm text-center mb-5">
              Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 glass border border-white/10 rounded-xl text-zinc-400 hover:text-white text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/25 text-sm font-semibold transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
