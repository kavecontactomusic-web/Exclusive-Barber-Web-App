import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, ClipboardList, Users, Scissors,
  UserCircle, BarChart2, Settings, LogOut, ExternalLink, Menu, Bell,
  CheckCheck, Clock, UserPlus, AlertCircle, CalendarCheck,
} from 'lucide-react';
import { businessConfig } from '../../config/business';

export type AdminTab = 'dashboard' | 'calendar' | 'bookings' | 'barbers' | 'services' | 'clients' | 'reports' | 'settings';

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

interface Notification {
  id: string;
  type: 'booking' | 'client' | 'alert' | 'reminder';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'booking',
    title: 'Nueva reserva',
    description: 'Carlos M. reservó Corte Fade con Juan para las 3:00 PM',
    time: 'Hace 5 min',
    read: false,
  },
  {
    id: 'n2',
    type: 'client',
    title: 'Nuevo cliente',
    description: 'Andrés García se registró desde la web',
    time: 'Hace 20 min',
    read: false,
  },
  {
    id: 'n3',
    type: 'alert',
    title: 'Reserva cancelada',
    description: 'Pedro L. canceló su cita de las 11:00 AM de hoy',
    time: 'Hace 1 h',
    read: false,
  },
  {
    id: 'n4',
    type: 'reminder',
    title: 'Recordatorio de cita',
    description: '3 citas pendientes de confirmar para mañana',
    time: 'Hace 2 h',
    read: true,
  },
  {
    id: 'n5',
    type: 'booking',
    title: 'Cita completada',
    description: 'Luis R. completó su servicio de Arreglo de Barba',
    time: 'Hace 3 h',
    read: true,
  },
];

const notifIcon = (type: Notification['type']) => {
  switch (type) {
    case 'booking': return <CalendarCheck size={14} className="text-gold" />;
    case 'client': return <UserPlus size={14} className="text-green-400" />;
    case 'alert': return <AlertCircle size={14} className="text-red-400" />;
    case 'reminder': return <Clock size={14} className="text-blue-400" />;
  }
};

const notifBg = (type: Notification['type']) => {
  switch (type) {
    case 'booking': return 'bg-gold/10 border-gold/20';
    case 'client': return 'bg-green-500/10 border-green-500/20';
    case 'alert': return 'bg-red-500/10 border-red-500/20';
    case 'reminder': return 'bg-blue-500/10 border-blue-500/20';
  }
};

const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'bookings', label: 'Reservas', icon: ClipboardList },
  { id: 'barbers', label: 'Barberos', icon: Users },
  { id: 'services', label: 'Servicios', icon: Scissors },
  { id: 'clients', label: 'Clientes', icon: UserCircle },
  { id: 'reports', label: 'Reportes', icon: BarChart2 },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({ activeTab, onTabChange, onLogout, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center">
            <Scissors size={14} className="text-dark" />
          </div>
          <div>
            <p className="font-serif font-bold text-sm text-white">{businessConfig.name}</p>
            <p className="text-zinc-600 text-[10px]">Panel Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { onTabChange(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              activeTab === id
                ? 'bg-gold/15 text-gold border border-gold/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-white/8 space-y-0.5">
        <a
          href="/"
          target="_blank"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ExternalLink size={16} />
          Ver Sitio
        </a>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0c0c0c]">
      <aside className="hidden lg:flex flex-col w-56 glass border-r border-white/8 shrink-0 fixed inset-y-0 left-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 glass border-r border-white/8 z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 glass border-b border-white/8 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 glass rounded-lg flex items-center justify-center text-zinc-400"
            >
              <Menu size={16} />
            </button>
            <h1 className="font-semibold text-white text-sm capitalize">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative w-8 h-8 glass rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50" style={{ background: '#1a1a1a' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/8" style={{ background: '#1a1a1a' }}>
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-gold" />
                      <span className="text-white text-sm font-semibold">Notificaciones</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-gold transition-colors"
                      >
                        <CheckCheck size={12} />
                        Marcar todas
                      </button>
                    )}
                  </div>

                  <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5" style={{ background: '#1a1a1a' }}>
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-zinc-600 text-sm">
                        Sin notificaciones
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => markRead(notif.id)}
                          className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors hover:bg-white/3 ${
                            !notif.read ? 'bg-white/2' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${notifBg(notif.type)}`}>
                            {notifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className={`text-xs font-semibold truncate ${notif.read ? 'text-zinc-400' : 'text-white'}`}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                              )}
                            </div>
                            <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                              {notif.description}
                            </p>
                            <p className="text-zinc-700 text-[10px] mt-1">{notif.time}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-white/8" style={{ background: '#1a1a1a' }}>
                      <button
                        onClick={() => { onTabChange('bookings'); setNotifOpen(false); }}
                        className="w-full text-center text-xs text-zinc-500 hover:text-gold transition-colors"
                      >
                        Ver todas las reservas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center text-xs font-bold text-dark">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
