import { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import type { Service, Barber, BookingState } from '../../types';
import { createBooking } from '../../services/bookings';
import Step1Service from './Step1Service';
import Step2Barber from './Step2Barber';
import Step3DateTime from './Step3DateTime';
import Step4Confirm from './Step4Confirm';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: Service | null;
}

const STEPS = ['Servicio', 'Barbero', 'Fecha & Hora', 'Confirmar'];

export default function BookingModal({ isOpen, onClose, preselectedService }: BookingModalProps) {
  const [state, setState] = useState<BookingState>({
    step: 1,
    selectedService: preselectedService || null,
    selectedBarber: null,
    selectedDate: '',
    selectedTime: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setState((s) => ({
        ...s,
        step: preselectedService ? 2 : 1,
        selectedService: preselectedService || null,
        selectedBarber: null,
        selectedDate: '',
        selectedTime: '',
        clientName: '',
        clientPhone: '',
        clientEmail: '',
      }));
      setSuccess(false);
      setError('');
    }
  }, [isOpen, preselectedService]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!state.selectedService) return;
    setLoading(true);
    setError('');
    try {
      const barber = state.selectedBarber;
      await createBooking({
        clientName: state.clientName,
        clientPhone: state.clientPhone,
        clientEmail: state.clientEmail,
        serviceId: state.selectedService.id,
        serviceName: state.selectedService.name,
        barberId: barber?.id ?? '',
        barberName: barber?.shortName ?? 'Sin preferencia',
        date: state.selectedDate,
        time: state.selectedTime,
        price: state.selectedService.price,
        status: 'pending',
      });
      setSuccess(true);
    } catch {
      setError('No se pudo confirmar la reserva. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const progressPct = ((state.step - 1) / (STEPS.length - 1)) * 100;

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-dark/90 backdrop-blur-xl" onClick={onClose} />
        <div className="relative glass rounded-3xl p-10 max-w-md w-full text-center animate-slide-up border border-white/10">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-green-400" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white mb-3">¡Cita Confirmada!</h2>
          <p className="text-zinc-400 mb-6">
            Tu cita ha sido reservada exitosamente. Te enviaremos un recordatorio 24h antes.
          </p>
          <div className="glass-gold rounded-2xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Servicio</span>
              <span className="text-white text-sm font-medium">{state.selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Barbero</span>
              <span className="text-white text-sm font-medium">
                {state.selectedBarber?.name || 'Sin preferencia'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Fecha</span>
              <span className="text-white text-sm font-medium">{state.selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Hora</span>
              <span className="text-white text-sm font-medium">{state.selectedTime}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-gold w-full py-3 rounded-full font-semibold">
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-xl" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl glass border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up max-h-[95vh] flex flex-col">
        <div className="h-1 bg-white/5 relative">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-300 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i + 1 < state.step
                      ? 'bg-gold text-dark'
                      : i + 1 === state.step
                      ? 'bg-gold/20 border border-gold text-gold'
                      : 'bg-white/5 border border-white/20 text-zinc-600'
                  }`}
                >
                  {i + 1 < state.step ? '✓' : i + 1}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    i + 1 === state.step ? 'text-white font-medium' : 'text-zinc-600'
                  }`}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-px hidden sm:block ${i + 1 < state.step ? 'bg-gold/50' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-6">
          {state.step === 1 && (
            <Step1Service
              selected={state.selectedService}
              onSelect={(s) => setState((prev) => ({ ...prev, selectedService: s, step: 2 }))}
            />
          )}
          {state.step === 2 && (
            <Step2Barber
              selected={state.selectedBarber}
              onSelect={(b) => setState((prev) => ({ ...prev, selectedBarber: b, step: 3 }))}
              onBack={() => setState((prev) => ({ ...prev, step: 1 }))}
            />
          )}
          {state.step === 3 && (
            <Step3DateTime
              barberId={state.selectedBarber?.id || ''}
              selectedDate={state.selectedDate}
              selectedTime={state.selectedTime}
              onSelect={(date, time) => setState((prev) => ({ ...prev, selectedDate: date, selectedTime: time, step: 4 }))}
              onBack={() => setState((prev) => ({ ...prev, step: 2 }))}
            />
          )}
          {state.step === 4 && (
            <Step4Confirm
              state={state}
              loading={loading}
              onChange={(field, value) => setState((prev) => ({ ...prev, [field]: value }))}
              onConfirm={handleConfirm}
              onBack={() => setState((prev) => ({ ...prev, step: 3 }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
