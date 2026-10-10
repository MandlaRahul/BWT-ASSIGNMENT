import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Pets from './pages/Pets.jsx';
import PetDetails from './pages/PetDetails.jsx';
import AdoptForm from './pages/AdoptForm.jsx';
import { Login, Signup } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { About, Contact } from './pages/Info.jsx';
import { CATS } from './constants.js';
import { useAuth } from './AuthContext.jsx';
import { Spinner } from './ui.jsx';

function Protected({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <Spinner />;
  return user ? children : <Navigate to="/login" state={{ from: loc.pathname }} replace />;
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0 }), [pathname]);
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {Object.keys(CATS).map(k => <Route key={k} path={'/' + k} element={<Pets key={k} slug={k} />} />)}
          <Route path="/adopt" element={<Pets key="all" slug="all" />} />
          <Route path="/pet/:id" element={<PetDetails />} />
          <Route path="/adopt/:id" element={<Protected><AdoptForm /></Protected>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<div className="wrap empty"><h2>Page not found</h2><p>This page wandered off. Head back and find a friend instead.</p></div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
