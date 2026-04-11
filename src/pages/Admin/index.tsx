import { useState, useEffect, useRef } from 'react';
import AdminLogin from './AdminLogin';
import AdminLayout, { type AdminTab } from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminBookings from './AdminBookings';
import AdminBarbers from './AdminBarbers';
import AdminServices from './AdminServices';
import AdminCalendar from './AdminCalendar';
import AdminClients from './AdminClients';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import { getBookings } from '../../services/bookings';

const SESSION_KEY = 'exclusive_barber_admin_logged_in';

function playNotificationSound() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem(SESSION_KEY) === 'true';
  });
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const lastBookingCount = useRef<number | null>(null);
  const [newBookingAlert, setNewBookingAlert] = useState(false);

  const handleLogin = () => {
    localStorage.setItem(SESSION_KEY, 'true');
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setLoggedIn(false);
  };

  // Polling cada 30 segundos para detectar citas nuevas
  useEffect(() => {
    if (!loggedIn) return;

    const checkNewBookings = async () => {
      try {
        const bookings = await getBookings();
        const count = bookings.length;
        if (lastBookingCount.current === null) {
          lastBookingCount.current = count;
        } else if (count > lastBookingCount.current) {
          playNotificationSound();
          setNewBookingAlert(true);
          lastBookingCount.current = count;
          setTimeout(() => setNewBookingAlert(false), 5000);
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkNewBookings();
    const interval = setInterval(checkNewBookings, 30000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  if (!loggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'calendar': return <AdminCalendar />;
      case 'bookings': return <AdminBookings />;
      case 'barbers': return <AdminBarbers />;
      case 'services': return <AdminServices />;
      case 'clients': return <AdminClients />;
      case 'reports': return <AdminReports />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <>
      {newBookingAlert && (
        <div className="fixed top-4 right-4 z-[200] bg-gold text-dark px-5 py-3 rounded-2xl shadow-gold font-semibold text-sm animate-slide-up flex items-center gap-2">
          🔔 ¡Nueva cita recibida!
        </div>
      )}
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
        {renderContent()}
      </AdminLayout>
    </>
  );
}