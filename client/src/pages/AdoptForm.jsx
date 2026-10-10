import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, useFetch } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { Confirm, Modal, PetImg, Spinner, useToast, Icon } from '../ui.jsx';

export default function AdoptForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { data, err, loading } = useFetch('/pets/' + id);
  const [f, setF] = useState({ phone: user.phone || '', address: '', housing: '', experience: '', otherPets: '', reason: '', visitDate: '' });
  const [errs, setErrs] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  if (loading) return <Spinner />;
  if (err || !data) return <div className="wrap empty"><h2>Pet not found</h2></div>;
  const pet = data.pet;
  const today = new Date().toISOString().slice(0, 10);

  const validate = () => {
    const e = {};
    if (!/^[0-9+\-\s()]{7,15}$/.test(f.phone)) e.phone = 'Enter a valid phone number';
    if (f.address.trim().length < 8) e.address = 'Enter your full address';
    if (!f.housing) e.housing = 'Choose your home type';
    if (!f.experience) e.experience = 'Choose your experience level';
    if (f.reason.trim().length < 20) e.reason = 'Please write at least 20 characters';
    if (!f.visitDate || f.visitDate < today) e.visitDate = 'Choose a date from today onward';
    setErrs(e); return !Object.keys(e).length;
  };
  const submit = async () => {
    setBusy(true);
    try { await api('/adoptions', { method: 'POST', body: { petId: pet._id, ...f } }); setConfirm(false); setDone(true); }
    catch (e) { setConfirm(false); if (/reserved|available/i.test(e.message)) setGone(true); else toast(e.message, 'err'); }
    finally { setBusy(false); }
  };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const Err = ({ k }) => errs[k] ? <span className="field-err">{errs[k]}</span> : null;

  if (pet.status !== 'Available' && !done) return <div className="wrap empty"><h2>{pet.name} is {pet.status.toLowerCase()}</h2><p>Someone else got there first. Many more friends are waiting.</p><Link to="/adopt" className="btn btn-blue">Browse pets</Link></div>;

  return (
    <div className="wrap form-page">
      <aside className="summary">
        <PetImg pet={pet} />
        <h2>{pet.name}</h2><p className="muted">{pet.breed} · {pet.age} · {pet.gender}</p>
        <p className="small">{pet.shelter?.name}{pet.shelter?.city ? `, ${pet.shelter.city}` : ''}</p>
        <div className="notice small"><b>How it works.</b> When you submit, {pet.name} is held for you so no one else can reserve them. The shelter reviews your request and you can track it on your dashboard.</div>
        <p className="small"><b>Requirements:</b> {pet.requirements}</p>
      </aside>
      <form className="card-form" onSubmit={e => { e.preventDefault(); validate() && setConfirm(true); }} noValidate>
        <h1>Adoption request</h1>
        <p className="muted">Applying as <b>{user.name}</b> ({user.email})</p>
        <div className="fgrid">
          <label>Phone number<input value={f.phone} onChange={set('phone')} placeholder="+91 98765 43210" /><Err k="phone" /></label>
          <label>Meet-and-greet date<input type="date" min={today} value={f.visitDate} onChange={set('visitDate')} /><Err k="visitDate" /></label>
          <label className="full">Home address<input value={f.address} onChange={set('address')} placeholder="House no, street, city, PIN" /><Err k="address" /></label>
          <label>Type of home<select value={f.housing} onChange={set('housing')}><option value="">Select...</option><option>House with yard</option><option>House without yard</option><option>Apartment</option><option>Farm / rural</option></select><Err k="housing" /></label>
          <label>Pet experience<select value={f.experience} onChange={set('experience')}><option value="">Select...</option><option>First-time owner</option><option>Some experience</option><option>Experienced</option></select><Err k="experience" /></label>
          <label className="full">Other pets at home (optional)<input value={f.otherPets} onChange={set('otherPets')} placeholder="e.g. one cat, 4 years old" /></label>
          <label className="full">Why do you want to adopt {pet.name}?<textarea rows="4" value={f.reason} onChange={set('reason')} placeholder="Tell us about your family, schedule and plans for your new companion." /><Err k="reason" /></label>
        </div>
        <button className="btn btn-amber btn-lg block">Review and reserve {pet.name}</button>
      </form>

      <Confirm open={confirm} busy={busy} yes={`Reserve ${pet.name}`} title="Confirm your request" text={`We will reserve ${pet.name} for you and send your application to ${pet.shelter?.name}. You can cancel while it is pending.`} onYes={submit} onNo={() => setConfirm(false)} />
      <Modal open={done} onClose={() => nav('/dashboard')} title="Request submitted!">
        <div className="success-ic"><Icon n="check" size={40} /></div>
        <p>{pet.name} is now reserved for you. Track the decision from your dashboard.</p>
        <div className="row end gap"><Link to="/adopt" className="btn btn-ghost">Keep browsing</Link><Link to="/dashboard" className="btn btn-blue">Track request</Link></div>
      </Modal>
      <Modal open={gone} onClose={() => nav('/adopt')} title="Just missed it">
        <p>Someone else reserved {pet.name} a moment ago. Your request was not submitted, but many more pets are waiting.</p>
        <div className="row end"><Link to="/adopt" className="btn btn-blue">Browse pets</Link></div>
      </Modal>
    </div>
  );
}
