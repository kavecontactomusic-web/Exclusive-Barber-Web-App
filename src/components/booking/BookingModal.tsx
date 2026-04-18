import { useState, useEffect } from 'react';
import { X, CheckCircle, Users, User } from 'lucide-react';
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

interface PersonBooking {
  selectedService: Service | null;
  selectedBarber: Barber | null;
  selectedDate: string;
  selectedTime: string;
}

const emptyPerson = (): PersonBooking => ({
  selectedService: null,
  selectedBarber: null,
  selectedDate: '',
  selectedTime: '',
});

const STEPS = ['Servicio', 'Barbero', 'Fecha & Hora', 'Confirmar'];

export default function BookingModal({ isOpen, onClose, preselectedService }: BookingModalProps) {
  const [groupSize, setGroupSize] = useState<number | null>(null);
  const [currentPerson, setCurrentPerson] = useState(0);
  const [persons, setPersons] = useState<PersonBooking[]>([emptyPerson()]);
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGroupSize(null);
      setCurrentPerson(0);
      setPersons([emptyPerson()]);
      setStep(preselectedService ? 2 : 1);
      setClientName('');
      setClientPhone('');
      setClientEmail('');
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

  const updatePerson = (field: keyof PersonBooking, value: Service | Barber | string | null) => {
    setPersons(prev => prev.map((p, i) => i === currentPerson ? { ...p, [field]: value } : p));
  };

  const currentState: BookingState = {
    step,
    selectedService: persons[currentPerson]?.selectedService ?? null,
    selectedBarber: persons[currentPerson]?.selectedBarber ?? null,
    selectedDate: persons[currentPerson]?.selectedDate ?? '',
    selectedTime: persons[currentPerson]?.selectedTime ?? '',
    clientName,
    clientPhone,
    clientEmail,
  };

  // Slots ya seleccionados por personas anteriores — para bloquearlos en la persona actual
  const getPendingSlots = () => {
    const currentBarberId = persons[currentPerson]?.selectedBarber?.id;
    return persons
      .slice(0, currentPerson)
      .filter((p) => p.selectedBarber?.id === currentBarberId && p.selectedDate && p.selectedTime && p.selectedService)
      .map((p) => ({
        time: p.selectedTime,
        duration: p.selectedService!.duration ?? 30,
        date: p.selectedDate,
      }));
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      for (const person of persons) {
        if (!person.selectedService) continue;
        await createBooking({
          clientName,
          clientPhone,
          clientEmail,
          serviceId: person.selectedService.id,
          serviceName: person.selectedService.name,
          barberId: person.selectedBarber?.id ?? '',
          barberName: person.selectedBarber?.shortName ?? '',
          date: person.selectedDate,
          time: person.selectedTime,
          price: person.selectedService.price,
          duration: person.selectedService.duration ?? 30,
          status: 'pending',
        });
      }
      setSuccess(true);
    } catch {
      setError('No se pudo confirmar la reserva. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPerson = () => {
    const next = currentPerson + 1;
    if (next < persons.length) {
      setCurrentPerson(next);
      setStep(1);
    } else {
      setStep(4);
    }
  };

  const progressPct = groupSize
    ? ((currentPerson / (persons.length)) + (step - 1) / (STEPS.length - 1) / persons.length) * 100
    : ((step - 1) / (STEPS.length - 1)) * 100;

  if (groupSize === null) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-dark/80 backdrop-blur-xl" />
        <div className="relative w-full sm:max-w-2xl glass border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up max-h-[95vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <h2 className="font-serif text-xl font-bold text-white">Nueva Reserva</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="p-6">
            <h3 className="font-serif text-2xl font-bold text-white mb-1">¿Cuántas personas?</h3>
            <p className="text-zinc-500 text-sm mb-6">Selecciona si es una reserva individual o grupal</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => { setGroupSize(1); setPersons([emptyPerson()]); }}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-white/8 glass hover:border-gold/40 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <User size={22} className="text-gold" />
                </div>
                <div>
                  <p className="text-white font-medium">Individual</p>
                  <p className="text-zinc-500 text-xs">1 persona</p>
                </div>
              </button>
              <button
                onClick={() => { setGroupSize(2); setPersons([emptyPerson(), emptyPerson()]); }}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-white/8 glass hover:border-gold/40 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Users size={22} className="text-gold" />
                </div>
                <div>
                  <p className="text-white font-medium">Grupal</p>
                  <p className="text-zinc-500 text-xs">2 o más personas</p>
                </div>
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => { setGroupSize(n); setPersons(Array.from({ length: n }, emptyPerson)); }}
                  className="py-3 rounded-xl border border-white/10 glass hover:border-gold/40 text-white font-bold text-lg transition-all"
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-zinc-600 text-xs text-center mt-2">Selecciona la cantidad exacta de personas</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-dark/90 backdrop-blur-xl" />
        <div className="relative glass rounded-3xl p-10 max-w-md w-full text-center animate-slide-up border border-white/10">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-green-400" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white mb-3">¡Citas Confirmadas!</h2>
          <p className="text-zinc-400 mb-6">
            {persons.length > 1
              ? `Se han reservado ${persons.length} citas exitosamente.`
              : 'Tu cita ha sido reservada exitosamente.'}
          </p>
          <div className="space-y-3 mb-6">
            {persons.map((p, i) => (
              <div key={i} className="glass-gold rounded-2xl p-4 text-left space-y-1">
                {persons.length > 1 && <p className="text-gold text-xs font-semibold mb-2">Persona {i + 1}</p>}
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Servicio</span>
                  <span className="text-white text-xs font-medium">{p.selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Barbero</span>
                  <span className="text-white text-xs font-medium">{p.selectedBarber?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Fecha & Hora</span>
                  <span className="text-white text-xs font-medium">{p.selectedDate} {p.selectedTime}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="btn-gold w-full py-3 rounded-full font-semibold">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-xl" />
      <div className="relative w-full sm:max-w-2xl glass border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up max-h-[95vh] flex flex-col">
        <div className="h-1 bg-white/5 relative">
          <div className="h-full bg-gradient-to-r from-gold-400 to-gold-300 transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            {persons.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
                <Users size={12} />
                Persona {currentPerson + 1} de {persons.length}
              </div>
            )}
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i + 1 < step ? 'bg-gold text-dark' : i + 1 === step ? 'bg-gold/20 border border-gold text-gold' : 'bg-white/5 border border-white/20 text-zinc-600'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-white font-medium' : 'text-zinc-600'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`w-4 h-px hidden sm:block ${i + 1 < step ? 'bg-gold/50' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <div className="overflow-y-auto flex-1 p-6">
          {step === 1 && (
            <Step1Service
              selected={persons[currentPerson].selectedService}
              onSelect={(s) => { updatePerson('selectedService', s); setStep(2); }}
            />
          )}
          {step === 2 && (
            <Step2Barber
              selected={persons[currentPerson].selectedBarber}
              onSelect={(b) => { updatePerson('selectedBarber', b); setStep(3); }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3DateTime
              barberId={persons[currentPerson].selectedBarber?.id || ''}
              selectedDate={persons[currentPerson].selectedDate}
              selectedTime={persons[currentPerson].selectedTime}
              serviceDuration={persons[currentPerson].selectedService?.duration ?? 30}
              pendingSlots={getPendingSlots()}
              onSelect={(date, time) => {
                updatePerson('selectedDate', date);
                updatePerson('selectedTime', time);
                handleNextPerson();
              }}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <Step4Confirm
              state={currentState}
              loading={loading}
              persons={persons}
              onChange={(field, value) => {
                if (field === 'clientName') setClientName(value);
                if (field === 'clientPhone') setClientPhone(value);
                if (field === 'clientEmail') setClientEmail(value);
              }}
              onConfirm={handleConfirm}
              onBack={() => {
                setCurrentPerson(persons.length - 1);
                setStep(3);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}