import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Icon, useToast, Paw } from '../ui.jsx';

export function About() {
  const items = [['Every animal, one place', 'Dogs, cats, rabbits, reptiles and small pets from trusted shelters, each with a full profile.'], ['Honest health information', 'We clearly separate verified vet records from general care advice, so you know what is fact and what is guidance.'], ['Responsible adoption', 'Each pet is held for one family at a time, applications are reviewed, and care and legal notes come first.']];
  return (
    <>
      <section className="page-hero"><div className="wrap"><h1>About PawHaven</h1><p className="lead">Love, care and responsible ownership</p><p className="blurb">We connect shelters with people ready to open their homes, and make every step of adoption clear and kind.</p></div></section>
      <div className="wrap about">
        {items.map(([t, d]) => <div className="care-box" key={t}><Paw size={30} /><h3>{t}</h3><p>{d}</p></div>)}
      </div>
      <section className="wrap cta-band"><div><h2>Ready to meet your match?</h2><p>Every adoption makes room for the next animal in need.</p></div><Link to="/adopt" className="btn btn-blue btn-lg">Find a pet</Link></section>
    </>
  );
}

export function Contact() {
  const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try { await api('/contact', { method: 'POST', body: f }); toast('Message sent. We will reply soon!'); setF({ name: '', email: '', subject: '', message: '' }); }
    catch (x) { toast(x.message, 'err'); } finally { setBusy(false); }
  };
  const s = k => e => setF({ ...f, [k]: e.target.value });
  return (
    <>
      <section className="page-hero"><div className="wrap"><h1>Contact us</h1><p className="lead">We would love to hear from you</p></div></section>
      <div className="wrap form-page contact">
        <aside className="summary">
          <h2>Get in touch</h2>
          <p><Icon n="mail" size={16} /> hello@pawhaven.example</p>
          <p><Icon n="phone" size={16} /> +91 40 0000 0000</p>
          <p><Icon n="pin" size={16} /> Hyderabad, Telangana</p>
          <div className="notice small">For urgent animal health concerns, please contact a qualified veterinarian directly.</div>
        </aside>
        <form className="card-form" onSubmit={submit}>
          <div className="fgrid">
            <label>Name<input required value={f.name} onChange={s('name')} /></label>
            <label>Email<input required type="email" value={f.email} onChange={s('email')} /></label>
            <label className="full">Subject<input value={f.subject} onChange={s('subject')} /></label>
            <label className="full">Message<textarea required minLength="10" rows="5" value={f.message} onChange={s('message')} /></label>
          </div>
          <button className="btn btn-blue btn-lg" disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button>
        </form>
      </div>
    </>
  );
}
