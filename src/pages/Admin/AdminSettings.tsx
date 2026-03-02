import { useState } from 'react';
import { Save } from 'lucide-react';
import { businessConfig } from '../../config/business';

export default function AdminSettings() {
  const [form, setForm] = useState({
    name: businessConfig.name,
    address: businessConfig.address,
    phone: businessConfig.phone,
    email: businessConfig.email,
    instagram: businessConfig.instagram,
    whatsapp: businessConfig.whatsapp,
    slotDuration: '30',
    minAdvance: '1',
    maxAhead: '14',
    whatsappReminder24: true,
    whatsappReminder2: true,
    emailConfirmation: true,
  });

  const update = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="glass rounded-2xl p-6 border border-white/8">
        <h3 className="font-semibold text-white mb-5">Información del Negocio</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Nombre', type: 'text' },
            { key: 'phone', label: 'Teléfono', type: 'tel' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'whatsapp', label: 'WhatsApp', type: 'text' },
            { key: 'instagram', label: 'Instagram', type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => update(key, e.target.value)}
                className="w-full px-4 py-2.5 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gold/40 bg-transparent"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className="w-full px-4 py-2.5 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gold/40 bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/8">
        <h3 className="font-semibold text-white mb-5">Reglas de Reserva</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'slotDuration', label: 'Duración del turno (min)', opts: ['15', '30', '45', '60'] },
            { key: 'minAdvance', label: 'Anticipación mínima (h)', opts: ['1', '2', '4', '12', '24'] },
            { key: 'maxAhead', label: 'Días anticipados máx', opts: ['7', '14', '30', '60'] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">{label}</label>
              <select
                value={form[key as keyof typeof form] as string}
                onChange={(e) => update(key, e.target.value)}
                className="w-full px-4 py-2.5 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none appearance-none bg-transparent cursor-pointer"
              >
                {opts.map((o) => (
                  <option key={o} value={o} className="bg-dark">{o}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/8">
        <h3 className="font-semibold text-white mb-5">Notificaciones</h3>
        <div className="space-y-4">
          {[
            { key: 'whatsappReminder24', label: 'Recordatorio WhatsApp 24h antes' },
            { key: 'whatsappReminder2', label: 'Recordatorio WhatsApp 2h antes' },
            { key: 'emailConfirmation', label: 'Confirmación por email al reservar' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-zinc-300 text-sm">{label}</span>
              <button
                onClick={() => update(key, !form[key as keyof typeof form])}
                className={`w-11 h-6 rounded-full transition-all relative ${
                  form[key as keyof typeof form] ? 'bg-gold' : 'bg-white/15'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-dark transition-all ${
                    form[key as keyof typeof form] ? 'left-5.5 translate-x-0.5' : 'left-0.5'
                  }`}
                  style={{ left: (form[key as keyof typeof form] as boolean) ? '22px' : '2px' }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="btn-gold px-6 py-3 rounded-full font-semibold flex items-center gap-2"
      >
        {saved ? (
          <span>Guardado</span>
        ) : (
          <>
            <Save size={16} />
            <span>Guardar Cambios</span>
          </>
        )}
      </button>
    </div>
  );
}
