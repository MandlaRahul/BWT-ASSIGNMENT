import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ICONS = {
  heart: 'M12 21s-7-4.4-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4',
  right: 'M5 12h14m-6-6 6 6-6 6', left: 'M19 12H5m6-6-6 6 6 6',
  menu: 'M4 7h16M4 12h16M4 17h16', close: 'M6 6l12 12M18 6 6 18',
  home: 'M3 11 12 3l9 8v10h-6v-6H9v6H3z', chat: 'M4 5h16v11H9l-5 4z',
  filter: 'M4 6h16M7 12h10M10 18h4', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0',
  check: 'M5 12l5 5 9-10', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v4m8-4v4', pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  plus: 'M12 5v14M5 12h14', edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z'
};
export function Icon({ n, size = 20, ...p }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d={ICONS[n]} /></svg>;
}
export function Paw({ size = 24, ...p }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><ellipse cx="5.5" cy="10.5" rx="2.1" ry="2.9" /><ellipse cx="9.8" cy="5.8" rx="2.1" ry="2.9" /><ellipse cx="16.2" cy="5.8" rx="2.1" ry="2.9" /><ellipse cx="20.5" cy="10.5" rx="2.1" ry="2.9" /><path d="M12 11c-3 0-6 3.5-6 6.2 0 2 1.6 2.8 3.4 2.8 1 0 1.8-.4 2.6-.4s1.6.4 2.6.4c1.8 0 3.4-.8 3.4-2.8C18 14.5 15 11 12 11z" /></svg>;
}
export function Logo({ light }) {
  return <Link to="/" className={'logo' + (light ? ' light' : '')}><span className="logo-mark"><Paw size={22} /></span><span className="logo-text">PawHaven<small>Pet adoption</small></span></Link>;
}
export function Stars({ value = 0, size = 16 }) {
  return <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>{[1, 2, 3, 4, 5].map(i => <svg key={i} width={size} height={size} viewBox="0 0 24 24" className={i <= Math.round(value) ? 'on' : ''}><path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5L9 8.9z" /></svg>)}</span>;
}
export function StarInput({ value, onChange }) {
  return <span className="stars input">{[1, 2, 3, 4, 5].map(i => <button type="button" key={i} aria-label={`${i} star`} onClick={() => onChange(i)} className={i <= value ? 'on' : ''}><svg width="28" height="28" viewBox="0 0 24 24"><path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5L9 8.9z" /></svg></button>)}</span>;
}
const EMO = { Dog: '🐶', Cat: '🐱', Rabbit: '🐰', Reptile: '🐍', Other: '🐹' };
const ph = c => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#cfe5fb'/><text x='50%' y='54%' font-size='200' text-anchor='middle' dominant-baseline='middle'>${EMO[c] || '🐾'}</text></svg>`);
export function PetImg({ pet, ...p }) {
  const [bad, setBad] = useState(false);
  return <img src={bad || !pet.image ? ph(pet.category) : pet.image} alt={`${pet.name}, ${pet.breed}`} loading="lazy" onError={() => setBad(true)} {...p} />;
}
export const Spinner = ({ label = 'Loading...' }) => <div className="spinner-wrap" role="status"><span className="spinner" /><span>{label}</span></div>;
export const StatusPill = ({ s }) => <span className={'pill ' + s}>{s}</span>;

const FKEY = 'pw_favs';
const readFavs = () => { try { return JSON.parse(localStorage.getItem(FKEY)) || []; } catch { return []; } };
export function useFavs() {
  const [favs, setFavs] = useState(readFavs);
  useEffect(() => { const h = () => setFavs(readFavs()); window.addEventListener('favs', h); return () => window.removeEventListener('favs', h); }, []);
  const toggle = id => { const c = readFavs(); localStorage.setItem(FKEY, JSON.stringify(c.includes(id) ? c.filter(x => x !== id) : [...c, id])); window.dispatchEvent(new Event('favs')); };
  return { favs, has: id => favs.includes(id), toggle };
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const h = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <button className="x" onClick={onClose} aria-label="Close"><Icon n="close" /></button>
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
export function Confirm({ open, title, text, yes = 'Confirm', danger, busy, onYes, onNo }) {
  return (
    <Modal open={open} onClose={onNo} title={title}>
      <p className="muted">{text}</p>
      <div className="row end gap">
        <button className="btn btn-ghost" onClick={onNo} disabled={busy}>Cancel</button>
        <button className={'btn ' + (danger ? 'btn-coral' : 'btn-blue')} onClick={onYes} disabled={busy}>{busy ? 'Please wait...' : yes}</button>
      </div>
    </Modal>
  );
}

const TCtx = createContext(() => {});
export const useToast = () => useContext(TCtx);
export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((msg, type = 'ok') => {
    const id = Math.random();
    setList(l => [...l, { id, msg, type }]);
    setTimeout(() => setList(l => l.filter(t => t.id !== id)), 3800);
  }, []);
  return (
    <TCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">{list.map(t => <div key={t.id} className={'toast ' + t.type}>{t.type === 'ok' ? <Icon n="check" size={18} /> : '!'}<span>{t.msg}</span></div>)}</div>
    </TCtx.Provider>
  );
}
