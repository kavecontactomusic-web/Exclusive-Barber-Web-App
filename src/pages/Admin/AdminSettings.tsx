import { useState, useEffect } from 'react';
import { Save, Lock, Eye, EyeOff, CheckCircle, Loader2, Clock } from 'lucide-react';
import { businessConfig } from '../../config/business';
import { updateAdminPassword, getAdminPassword } from '../../services/adminConfig';
import { getSchedule, updateDaySchedule } from '../../services/schedule';
import { getBookingRules, updateBookingRules } from '../../services/bookingRules';
import type { DaySchedule } from '../../services/schedule';

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 23; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
}

export default function AdminSettings() {
  const [form, setForm] = useState({
    name: businessConfig.name,
    address: businessConfig.address,
    phone: businessConfig.phone,
    email: businessConfig.email,
    instagram: businessConfig.instagram,
    whatsapp: businessConfig.whatsapp,
    whatsappReminder24: true,
    whatsappReminder2: true,
    emailConfirmation: true,
  });

  // Reglas de reserva — estado separado
  const [rules, setRules] = useState({
    slotDuration: '30',
    minAdvance: '1',
    maxAhead: '14',
  });
  const [savingRules, setSavingRules] = useState(false);
  const [rulesSaved, setRulesSaved] = useState(false);

  useEffect(() => {
    getBookingRules().then((r) => {
      setRules({
        slotDuration: String(r.slotDuration),
        minAdvance: String(r.minAdvanceHours),
        maxAhead: String(r.maxAheadDays),
      });
    });
  }, []);

  const handleSaveRules = async () => {
    setSavingRules(true);
    try {
      await updateBookingRules({
        slotDuration: Number(rules.slotDuration),
        minAdvanceHours: Number(rules.minAdvance),
        maxAheadDays: Number(rules.maxAhead),
      });
      setRulesSaved(true);
      setTimeout(() => setRulesSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error al guardar las reglas. Intenta de nuevo.');
    } finally {
      setSavingRules(false);
    }
  };

  const update = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const updateRule = (k: string, v: string) => setRules((r) => ({ ...r, [k]: v }));

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

  // Horarios
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [savedDay, setSavedDay] = useState<number | null>(null);

  useEffect(() => {
    getSchedule()
      .then(setSchedule)
      .finally(() => setLoadingSchedule(false));
  }, []);

  const updateDay = (dayOfWeek: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) =>
      prev.map((d) => d.day_of_week === dayOfWeek ? { ...d, [field]: value } : d)
    );
  };

  const saveDay = async (day: DaySchedule) => {
    setSavingDay(day.day_of_week);
    try {
      await updateDaySchedule(day);
      setSavedDay(day.day_of_week);
      setTimeout(() => setSavedDay(null), 2000);
    } catch {
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setSavingDay(null);
    }
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

      {/* Horarios */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
          <Clock size={16} className="text-gold" />
          Horarios de Atención
        </h3>
        {loadingSchedule ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gold" />
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((day) => (
              <div key={day.day_of_week} className="glass border border-white/8 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateDay(day.day_of_week, 'is_open', !day.is_open)}
                      className={`w-10 h-5 rounded-full transition-all relative ${day.is_open ? 'bg-gold' : 'bg-white/15'}`}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-dark transition-all"
                        style={{ left: day.is_open ? '22px' : '2px' }}
                      />
                    </button>
                    <span className="text-white font-medium text-sm">{day.day_name}</span>
                    {!day.is_open && <span className="text-xs text-zinc-600 italic">Cerrado</span>}
                  </div>
                  <button
                    onClick={() => saveDay(day)}
                    disabled={savingDay === day.day_of_week}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 disabled:opacity-50"
                  >
                    {savingDay === day.day_of_week ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : savedDay === day.day_of_week ? (
                      <><CheckCircle size={12} /> Guardado</>
                    ) : (
                      <><Save size={12} /> Guardar</>
                    )}
                  </button>
                </div>

                {day.is_open && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Apertura</label>
                      <select
                        value={day.open_time}
                        onChange={(e) => updateDay(day.day_of_week, 'open_time', e.target.value)}
                        className="w-full px-3 py-2 glass border border-white/10 rounded-lg text-white text-xs focus:outline-none bg-transparent cursor-pointer"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t} className="bg-dark">{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Cierre</label>
                      <select
                        value={day.close_time}
                        onChange={(e) => updateDay(day.day_of_week, 'close_time', e.target.value)}
                        className="w-full px-3 py-2 glass border border-white/10 rounded-lg text-white text-xs focus:outline-none bg-transparent cursor-pointer"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t} className="bg-dark">{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Inicio almuerzo</label>
                      <select
                        value={day.lunch_start || ''}
                        onChange={(e) => updateDay(day.day_of_week, 'lunch_start', e.target.value || null as any)}
                        className="w-full px-3 py-2 glass border border-white/10 rounded-lg text-white text-xs focus:outline-none bg-transparent cursor-pointer"
                      >
                        <option value="" className="bg-dark">Sin almuerzo</option>
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t} className="bg-dark">{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Fin almuerzo</label>
                      <select
                        value={day.lunch_end || ''}
                        onChange={(e) => updateDay(day.day_of_week, 'lunch_end', e.target.value || null as any)}
                        className="w-full px-3 py-2 glass border border-white/10 rounded-lg text-white text-xs focus:outline-none bg-transparent cursor-pointer"
                      >
                        <option value="" className="bg-dark">Sin almuerzo</option>
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t} className="bg-dark">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reglas de Reserva — guarda en Supabase */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <h3 className="font-semibold text-white mb-5">Reglas de Reserva</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            { key: 'slotDuration', label: 'Duración del turno (min)', opts: ['15', '30', '45', '60'] },
            { key: 'minAdvance', label: 'Anticipación mínima (h)', opts: ['1', '2', '4', '12', '24'] },
            { key: 'maxAhead', label: 'Días anticipados máx', opts: ['7', '14', '30', '60'] },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">{label}</label>
              <select
                value={rules[key as keyof typeof rules]}
                onChange={(e) => updateRule(key, e.target.value)}
                className="w-full px-4 py-2.5 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none appearance-none bg-transparent cursor-pointer"
              >
                {opts.map((o) => (
                  <option key={o} value={o} className="bg-dark">{o}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveRules}
          disabled={savingRules}
          className="btn-gold px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {savingRules ? (
            <><Loader2 size={15} className="animate-spin" /><span>Guardando...</span></>
          ) : rulesSaved ? (
            <><CheckCircle size={15} /><span>Guardado ✓</span></>
          ) : (
            <><Save size={15} /><span>Guardar Reglas</span></>
          )}
        </button>
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
                className={`w-11 h-6 rounded-full transition-all relative ${form[key as keyof typeof form] ? 'bg-gold' : 'bg-white/15'}`}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-dark transition-all"
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
        {saved ? <span>Guardado</span> : <><Save size={16} /><span>Guardar Cambios</span></>}
      </button>
    </div>
  );
}