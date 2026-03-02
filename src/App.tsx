import { useState, useEffect } from 'react';
import LandingPage from './pages/Landing';
import AdminPage from './pages/Admin/index';
import BarberPage from './pages/Barber/index';

function getRoute(): 'landing' | 'admin' | 'barber' {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/barber')) return 'barber';
  return 'landing';
}

export default function App() {
  const [route, setRoute] = useState<'landing' | 'admin' | 'barber'>(getRoute);

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  useEffect(() => {
    const expected = route === 'landing' ? '/' : `/${route}`;
    if (window.location.pathname !== expected) {
      window.history.pushState(null, '', expected);
    }
  }, [route]);

  if (route === 'admin') return <AdminPage />;
  if (route === 'barber') return <BarberPage />;
  return <LandingPage />;
}
