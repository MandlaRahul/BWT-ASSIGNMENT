import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Logo, Icon } from '../ui.jsx';
import { useAuth } from '../AuthContext.jsx';
import { NAV } from '../constants.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  useEffect(() => setOpen(false), [loc.pathname]);
  const search = e => { e.preventDefault(); nav('/adopt' + (q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '')); };

  return (
    <header className="nav">
      <div className="nav-top">
        <Logo light />
        <form className="nav-search" onSubmit={search} role="search">
          <Icon n="search" size={18} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search breed, name, colour..." aria-label="Search pets" />
          <Link to="/adopt" className="filters-btn"><Icon n="filter" size={16} /> Filters</Link>
        </form>
        <div className="nav-actions">
          {user ? (
            <>
              <Link className="btn btn-white" to="/dashboard"><Icon n="user" size={18} /> {user.name.split(' ')[0]}</Link>
              <button className="btn btn-outline" onClick={() => { logout(); nav('/'); }}>Log out</button>
            </>
          ) : (
            <>
              <Link className="btn btn-white" to="/login">Login</Link>
              <Link className="btn btn-amber" to="/signup">Sign up</Link>
            </>
          )}
        </div>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}><Icon n={open ? 'close' : 'menu'} size={26} /></button>
      </div>
      <nav className={'nav-links' + (open ? ' open' : '')} aria-label="Main">
        {NAV.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        <div className="nav-mobile-actions">
          {user ? <button className="btn btn-white" onClick={() => { logout(); nav('/'); }}>Log out</button>
            : <><Link className="btn btn-white" to="/login">Login</Link><Link className="btn btn-amber" to="/signup">Sign up</Link></>}
        </div>
      </nav>
    </header>
  );
}
