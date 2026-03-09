import { useState } from 'react';
import { Save, Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { businessConfig } from '../../config/business';
import { updateAdminPassword, getAdminPassword } from '../../services/adminConfig';

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

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPws, setShowPws] = useState({ current: false, newPw: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async () => {
    setPwError('');
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { setPwError('Completa todos los campos'); return; }
    if (pwForm.newPw.length < 6) { setPwError('Mínimo 6 caracteres'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Las contraseñas no coinciden'); return; }
    setPwLoading(true);
    try {
      const current = await getAdminPassword();
      if (pwForm.current !== current) { setPwError('Contraseña actual incorrecta'); setPwLoading(false); return; }
      await updateAdminPassword(pwForm.newPw);
      setPwSaved(true);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 3000);
    } catch { setPwError('Error al cambiar contraseña.'); }
    setPwLoading(false);
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

      <div className="glass rounded-2xl p-6 border border-white/8">
        <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
          <Lock size={16} className="text-gold" />
          Cambiar Contraseña
        </h3>
        <div className="space-y-4">
          {[
            { key: 'current', label: 'Contraseña actual' },
            { key: 'newPw', label: 'Nueva contraseña' },
            { key: 'confirm', label: 'Confirmar nueva contraseña' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">{label}</label>
              <div className="relative">
                <input
                  type={showPws[key as keyof typeof showPws] ? 'text' : 'password'}
                  value={pwForm[key as keyof typeof pwForm]}
                  onChange={(e) => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-11 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gold/40 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPws(s => ({ ...s, [key]: !s[key as keyof typeof s] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPws[key as keyof typeof showPws] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          {pwError && <p className="text-red-400 text-xs">{pwError}</p>}
          <button
            onClick={handlePasswordChange}
            disabled={pwLoading}
            className="btn-gold px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 text-sm"
          >
            {pwSaved ? (
              <><CheckCircle size={15} /><span>Contraseña actualizada</span></>
            ) : pwLoading ? (
              <><Loader2 size={15} className="animate-spin" /><span>Guardando...</span></>
            ) : (
              <><Lock size={15} /><span>Cambiar Contraseña</span></>
            )}
          </button>
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