import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { Paw, useToast, Modal, Icon } from '../ui.jsx';

function Shell({ title, sub, children, foot }) {
  return (
    <div className="auth">
      <div className="auth-art">
        <Paw size={56} />
        <h2>Adopt love.<br />Save a life.</h2>
        <p>Create an account to reserve pets, track requests and save your favourites.</p>
      </div>
      <div className="auth-form">
        <h1>{title}</h1><p className="muted">{sub}</p>
        {children}
        <p className="auth-foot">{foot}</p>
      </div>
    </div>
  );
}

function usePwd() { const [show, setShow] = useState(false); return [show, <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}><Icon n="eye" size={18} /></button>]; }
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function Login() {
  const { login, user } = useAuth(); const nav = useNavigate(); const loc = useLocation(); const toast = useToast();
  const [f, setF] = useState({ email: '', password: '' }); const [e, setE] = useState({}); const [busy, setBusy] = useState(false); const [show, eye] = usePwd();
  if (user) return <Navigate to={loc.state?.from || '/dashboard'} replace />;
  const submit = async ev => {
    ev.preventDefault();
    const er = {}; if (!emailOk(f.email)) er.email = 'Enter a valid email'; if (!f.password) er.password = 'Enter your password';
    setE(er); if (Object.keys(er).length) return;
    setBusy(true);
    try { const u = await login(f.email, f.password); toast(`Welcome back, ${u.name.split(' ')[0]}!`); nav(loc.state?.from || '/dashboard', { replace: true }); }
    catch (x) { setE({ form: x.message }); } finally { setBusy(false); }
  };
  return (
    <Shell title="Welcome back" sub="Log in to manage your adoption requests." foot={<>New here? <Link to="/signup">Create an account</Link></>}>
      <form onSubmit={submit} noValidate>
        {e.form && <div className="alert">{e.form}</div>}
        <label>Email<input type="email" value={f.email} onChange={x => setF({ ...f, email: x.target.value })} autoComplete="email" />{e.email && <span className="field-err">{e.email}</span>}</label>
        <label>Password<div className="pwd"><input type={show ? 'text' : 'password'} value={f.password} onChange={x => setF({ ...f, password: x.target.value })} autoComplete="current-password" />{eye}</div>{e.password && <span className="field-err">{e.password}</span>}</label>
        <button className="btn btn-blue btn-lg block" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        <p className="small muted hint">Demo: demo@pawhaven.com / Demo@123 · Admin: admin@pawhaven.com / Admin@123</p>
      </form>
    </Shell>
  );
}

export function Signup() {
  const { register, user } = useAuth(); const nav = useNavigate(); const loc = useLocation();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' }); const [e, setE] = useState({}); const [busy, setBusy] = useState(false); const [ok, setOk] = useState(false); const [show, eye] = usePwd();
  if (user && !ok) return <Navigate to="/dashboard" replace />;
  const submit = async ev => {
    ev.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = 'Enter your full name';
    if (!emailOk(f.email)) er.email = 'Enter a valid email';
    if (f.password.length < 6) er.password = 'Use at least 6 characters';
    if (f.confirm !== f.password) er.confirm = 'Passwords do not match';
    setE(er); if (Object.keys(er).length) return;
    setBusy(true);
    try { await register(f.name, f.email, f.password); setOk(true); } catch (x) { setE({ form: x.message }); } finally { setBusy(false); }
  };
  const s = k => x => setF({ ...f, [k]: x.target.value });
  return (
    <Shell title="Create your account" sub="Join PawHaven and start your adoption journey." foot={<>Already have an account? <Link to="/login">Log in</Link></>}>
      <form onSubmit={submit} noValidate>
        {e.form && <div className="alert">{e.form}</div>}
        <label>Full name<input value={f.name} onChange={s('name')} autoComplete="name" />{e.name && <span className="field-err">{e.name}</span>}</label>
        <label>Email<input type="email" value={f.email} onChange={s('email')} autoComplete="email" />{e.email && <span className="field-err">{e.email}</span>}</label>
        <label>Password<div className="pwd"><input type={show ? 'text' : 'password'} value={f.password} onChange={s('password')} autoComplete="new-password" />{eye}</div>{e.password && <span className="field-err">{e.password}</span>}</label>
        <label>Confirm password<input type={show ? 'text' : 'password'} value={f.confirm} onChange={s('confirm')} autoComplete="new-password" />{e.confirm && <span className="field-err">{e.confirm}</span>}</label>
        <button className="btn btn-blue btn-lg block" disabled={busy}>{busy ? 'Creating account...' : 'Sign up'}</button>
      </form>
      <Modal open={ok} onClose={() => nav(loc.state?.from || '/dashboard')} title="Welcome to PawHaven!">
        <div className="success-ic"><Icon n="check" size={40} /></div>
        <p>Your account is ready. Find a companion and give them a loving home.</p>
        <div className="row end"><button className="btn btn-blue" onClick={() => nav('/adopt')}>Meet the pets</button></div>
      </Modal>
    </Shell>
  );
}
