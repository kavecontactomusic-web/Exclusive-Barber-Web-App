import { useState, useEffect } from 'react';
import { Star, Phone, Edit2, ToggleLeft, ToggleRight, X, Plus, User, Loader2, Trash2 } from 'lucide-react';
import { getBarbers, updateBarberAvailability, createBarber, updateBarber, deleteBarber } from '../../services/barbers';
import { getBookings } from '../../services/bookings';
import { formatCOP } from '../../data';
import type { Barber, Booking } from '../../types';

interface BarberForm {
  name: string;
  phone: string;
  bio: string;
  specialties: string;
  commission: number;
  pin: string;
}

const emptyForm: BarberForm = {
  name: '',
  phone: '',
  bio: '',
  specialties: '',
  commission: 30,
  pin: '',
};

export default function AdminBarbers() {
  const [list, setList] = useState<Barber[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Barber | null>(null);
  const [form, setForm] = useState<BarberForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<BarberForm>>({});
  const [saving, setSaving] = useState(false);

  const currentYearMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    Promise.all([getBarbers(), getBookings()])
      .then(([barberList, bookingList]) => {
        setList(barberList);
        setBookings(bookingList);
      })
      .finally(() => setLoading(false));
  }, []);

  // Calcular stats dinámicos por barbero
  const getBarberStats = (barberId: string) => {
    const barberBookings = bookings.filter(
      (b) => b.barberId === barberId &&
             b.date.startsWith(currentYearMonth) &&
             b.status === 'completed'
    );
    const services = barberBookings.length;
    const earnings = barberBookings.reduce((s, b) => s + b.price, 0);
    return { services, earnings };
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
    await deleteBarber(id);
    setList((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleAvailable = async (id: string) => {
    const barber = list.find((b) => b.id === id);
    if (!barber) return;
    const newVal = !barber.available;
    setList((prev) => prev.map((b) => b.id === id ? { ...b, available: newVal } : b));
    await updateBarberAvailability(id, newVal);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (barber: Barber) => {
    setEditTarget(barber);
    setForm({
      name: barber.name,
      phone: barber.phone,
      bio: barber.bio,
      specialties: barber.specialties.join(', '),
      commission: barber.commission,
      pin: '',
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const e: Partial<BarberForm> = {};
    if (!form.name.trim()) e.name = 'Nombre requerido';
    if (!form.phone.trim()) e.phone = 'Teléfono requerido';
    if (!form.bio.trim()) e.bio = 'Descripción requerida';
    if (!editTarget && !form.pin.trim()) e.pin = 'PIN requerido';
    if (form.pin && (form.pin.length < 4 || !/^\d+$/.test(form.pin))) e.pin = 'PIN debe ser numérico de al menos 4 dígitos';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    const specialties = form.specialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editTarget) {
        const updates: Partial<Barber> = {
          name: form.name,
          phone: form.phone,
          bio: form.bio,
          specialties,
          commission: form.commission,
        };
        if (form.pin) updates.pin = form.pin;
        await updateBarber(editTarget.id, updates);
        setList((prev) =>
          prev.map((b) =>
            b.id === editTarget.id ? { ...b, ...updates } : b
          )
        );
      } else {
        const initials = form.name
          .split(' ')
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase();

        const newBarber = await createBarber({
          name: form.name,
          shortName: form.name.split(' ')[0],
          avatar: initials,
          phone: form.phone,
          bio: form.bio,
          specialties,
          rating: 5.0,
          available: true,
          commission: form.commission,
          pin: form.pin,
        });
        setList((prev) => [...prev, newBarber]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field: keyof BarberForm) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-gold/50 transition-colors`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-zinc-500 text-sm">{list.length} barberos en el equipo</p>
        <button
          onClick={openAdd}
          className="btn-gold px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5"
        >
          <Plus size={15} />
          Agregar Barbero
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {list.map((barber) => {
            const { services, earnings } = getBarberStats(barber.id);
            const commission = Math.round(earnings * barber.commission / 100);

            return (
              <div key={barber.id} className="glass rounded-2xl p-6 border border-white/8">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-dark"
                      style={{ background: 'linear-gradient(135deg, #D4AF37, #9C7B22)' }}
                    >
                      {barber.avatar}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{barber.name}</p>
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-gold fill-gold" />
                        <span className="text-xs text-zinc-400">{barber.rating} ({barber.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAvailable(barber.id)}
                    className="text-zinc-400 hover:text-gold transition-colors"
                  >
                    {barber.available
                      ? <ToggleRight size={28} className="text-green-400" />
                      : <ToggleLeft size={28} className="text-zinc-600" />
                    }
                  </button>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={13} className="text-zinc-600" />
                    <span className="text-zinc-400">{barber.phone}</span>
                  </div>
                  <p className="text-zinc-500 text-xs leading-relaxed">{barber.bio}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {barber.specialties.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 glass border border-white/10 rounded-full text-zinc-400">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="glass rounded-xl p-2.5 text-center">
                    <p className="font-mono text-sm font-bold text-white">{services}</p>
                    <p className="text-zinc-600 text-[10px]">Servicios</p>
                  </div>
                  <div className="glass rounded-xl p-2.5 text-center">
                    <p className="font-mono text-xs font-bold gold-text">{formatCOP(earnings)}</p>
                    <p className="text-zinc-600 text-[10px]">Ingresos</p>
                  </div>
                  <div className="glass rounded-xl p-2.5 text-center">
                    <p className="font-mono text-sm font-bold text-green-400">{barber.commission}%</p>
                    <p className="text-zinc-600 text-[10px]">Comisión</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(barber)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 glass border border-white/10 rounded-xl text-zinc-400 hover:text-white text-xs transition-all hover:border-gold/30"
                  >
                    <Edit2 size={13} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(barber.id, barber.name)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 glass border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 text-xs transition-all hover:border-red-400/40"
                  >
                    <Trash2 size={13} />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-2 glass rounded-xl">
                    <span className="text-zinc-600 text-xs">PIN:</span>
                    <span className="font-mono text-xs text-zinc-300">••••</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center">
                  <User size={15} className="text-gold" />
                </div>
                <h2 className="font-semibold text-white">
                  {editTarget ? 'Editar Barbero' : 'Nuevo Barbero'}
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
                <label className="text-zinc-400 text-xs mb-1.5 block">Nombre completo</label>
                <input
                  className={inputClass('name')}
                  placeholder="Ej: Juan Pérez"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-zinc-400 text-xs mb-1.5 block">Teléfono</label>
                <input
                  className={inputClass('phone')}
                  placeholder="Ej: +57 300 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-zinc-400 text-xs mb-1.5 block">Descripción / Bio</label>
                <textarea
                  className={`${inputClass('bio')} resize-none`}
                  rows={3}
                  placeholder="Describe al barbero, su experiencia..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
                {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio}</p>}
              </div>

              <div>
                <label className="text-zinc-400 text-xs mb-1.5 block">
                  Especialidades <span className="text-zinc-600">(separadas por coma)</span>
                </label>
                <input
                  className={inputClass('specialties')}
                  placeholder="Ej: Fade, Barba clásica, Navaja"
                  value={form.specialties}
                  onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                />
              </div>

              <div>
                <label className="text-zinc-400 text-xs mb-1.5 block">
                  Comisión: <span className="text-gold font-mono font-bold">{form.commission}%</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={5}
                  value={form.commission}
                  onChange={(e) => setForm({ ...form, commission: Number(e.target.value) })}
                  className="w-full accent-yellow-500 h-1.5 cursor-pointer"
                />
                <div className="flex justify-between text-zinc-600 text-xs mt-1">
                  <span>10%</span>
                  <span>70%</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-xs mb-1.5 block">
                  PIN de acceso{' '}
                  {editTarget && <span className="text-zinc-600">(dejar vacío para no cambiar)</span>}
                </label>
                <input
                  className={inputClass('pin')}
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Mínimo 4 dígitos numéricos"
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value })}
                />
                {errors.pin && <p className="text-red-400 text-xs mt-1">{errors.pin}</p>}
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
                {editTarget ? 'Guardar Cambios' : 'Crear Barbero'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}