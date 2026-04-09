import { ChevronLeft, Loader2, MessageCircle, Users } from 'lucide-react';
import { formatCOP } from '../../data';
import type { BookingState, Service, Barber } from '../../types';

interface PersonSummary {
  selectedService: Service | null;
  selectedBarber: Barber | null;
  selectedDate: string;
  selectedTime: string;
}

interface Props {
  state: BookingState;
  loading: boolean;
  onChange: (field: keyof BookingState, value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  persons?: PersonSummary[];
}

export default function Step4Confirm({ state, loading, onChange, onConfirm, onBack, persons }: Props) {
  const isValid = state.clientName.trim().length > 2 && state.clientPhone.trim().length >= 10;
  const isGroup = persons && persons.length > 1;
  const total = isGroup
    ? persons.reduce((sum, p) => sum + (p.selectedService?.price || 0), 0)
    : state.selectedService?.price || 0;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 hover:text-white text-sm mb-4 transition-colors">
        <ChevronLeft size={15} />
        Volver
      </button>

      <h3 className="font-serif text-2xl font-bold text-white mb-1">Confirmar reserva</h3>
      <p className="text-zinc-500 text-sm mb-5">Revisa los detalles y completa tus datos</p>

      <div className="glass-gold rounded-2xl p-5 mb-6 space-y-3">
        <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          {isGroup && <Users size={13} />}
          {isGroup ? `Resumen grupal (${persons.length} personas)` : 'Resumen de tu cita'}
        </h4>

        {isGroup ? (
          <div className="space-y-4">
            {persons.map((p, i) => (
              <div key={i} className="border border-white/8 rounded-xl p-3 space-y-2">
                <p className="text-gold text-xs font-semibold">Persona {i + 1}</p>
                {[
                  { label: 'Servicio', value: p.selectedService?.name },
                  { label: 'Duración', value: p.selectedService ? `${p.selectedService.duration} min` : '' },
                  { label: 'Barbero', value: p.selectedBarber?.name || 'Sin preferencia' },
                  { label: 'Fecha', value: p.selectedDate },
                  { label: 'Hora', value: p.selectedTime },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs">{label}</span>
                    <span className="text-white text-xs font-medium capitalize">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1 border-t border-white/8">
                  <span className="text-zinc-500 text-xs">Subtotal</span>
                  <span className="text-gold text-xs font-mono font-bold">{formatCOP(p.selectedService?.price || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          [
            { label: 'Servicio', value: state.selectedService?.name },
            { label: 'Categoría', value: state.selectedService?.category },
            { label: 'Duración', value: state.selectedService ? `${state.selectedService.duration} min` : '' },
            { label: 'Barbero', value: state.selectedBarber?.name || 'Sin preferencia' },
            { label: 'Fecha', value: state.selectedDate },
            { label: 'Hora', value: state.selectedTime },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">{label}</span>
              <span className="text-white text-sm font-medium capitalize">{value}</span>
            </div>
          ))
        )}

        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <span className="text-zinc-400 font-medium">Total</span>
          <span className="font-mono text-xl font-bold gold-text">{formatCOP(total)}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Nombre completo *</label>
          <input
            type="text"
            placeholder="Ej: Carlos Martínez"
            value={state.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold/40 transition-colors bg-transparent"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Teléfono (Colombia) *</label>
          <input
            type="tel"
            placeholder="300 123 4567"
            value={state.clientPhone}
            onChange={(e) => onChange('clientPhone', e.target.value)}
            className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold/40 transition-colors bg-transparent"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Email (opcional)</label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={state.clientEmail}
            onChange={(e) => onChange('clientEmail', e.target.value)}
            className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold/40 transition-colors bg-transparent"
          />
        </div>
      </div>

      <div className="glass rounded-xl p-4 mb-5 flex items-start gap-3">
        <MessageCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
        <p className="text-zinc-400 text-xs leading-relaxed">
          Recibirás un recordatorio por WhatsApp 24 horas y 2 horas antes de tu cita.
          Pago al llegar. Cancela con al menos 2 horas de anticipación.
        </p>
      </div>

      <button
        disabled={!isValid || loading}
        onClick={onConfirm}
        className="w-full btn-gold py-4 rounded-full font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /><span>Confirmando...</span></>
        ) : (
          <span>{isGroup ? `Confirmar ${persons.length} Reservas` : 'Confirmar Reserva'}</span>
        )}
      </button>
    </div>
  );
}