import { useState } from 'react';
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

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
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
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={() => setLoggedIn(false)}>
      {renderContent()}
    </AdminLayout>
  );
}
