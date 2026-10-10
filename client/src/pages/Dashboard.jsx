import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, useFetch } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { Confirm, Icon, Modal, PetImg, Spinner, StatusPill, useFavs, useToast } from '../ui.jsx';
import { fmtDate } from '../constants.js';
import PetCard from '../components/PetCard.jsx';

const Track = ({ s }) => {
  const step = s === 'Pending' ? 1 : 2;
  return <div className={'track ' + s}>{['Submitted', 'Under review', s === 'Rejected' ? 'Declined' : s === 'Approved' ? 'Approved' : 'Decision'].map((l, i) => <span key={l} className={i <= step ? 'on' : ''}>{l}</span>)}</div>;
};
const Load = ({ r, children }) => r.loading ? <Spinner /> : r.err ? <div className="alert">{r.err}</div> : children;

function Overview({ admin }) {
  const mine = useFetch(admin ? '/adoptions' : '/adoptions/mine');
  const stats = useFetch('/pets/stats');
  const a = mine.data?.adoptions || [];
  const n = s => a.filter(x => x.status === s).length;
  const cards = admin
    ? [['Total pets', stats.data?.total], ['Available', stats.data?.available], ['Adopted', stats.data?.adopted], ['Pending requests', n('Pending')]]
    : [['My requests', a.length], ['Pending', n('Pending')], ['Approved', n('Approved')], ['Declined', n('Rejected')]];
  return <><h2>{admin ? 'Shelter overview' : 'Your adoption journey'}</h2><div className="stat-cards">{cards.map(([k, v]) => <div key={k}><b>{v ?? '-'}</b><span>{k}</span></div>)}</div>
    {!admin && !a.length && !mine.loading && <div className="empty"><p>You have not sent any requests yet.</p><Link to="/adopt" className="btn btn-blue">Find a pet</Link></div>}</>;
}

function MyRequests() {
  const r = useFetch('/adoptions/mine'); const toast = useToast(); const [target, setTarget] = useState(null); const [busy, setBusy] = useState(false);
  const cancel = async () => { setBusy(true); try { await api('/adoptions/' + target, { method: 'DELETE' }); toast('Request cancelled. The pet is available again.'); r.reload(); } catch (e) { toast(e.message, 'err'); } setBusy(false); setTarget(null); };
  return <><h2>My adoption requests</h2><Load r={r}>
    {r.data?.adoptions.length ? r.data.adoptions.map(a => (
      <div className="req" key={a._id}>
        {a.pet ? <PetImg pet={a.pet} /> : <div className="thumb-ph" />}
        <div className="grow">
          <div className="row gap wrapx"><b>{a.pet?.name || 'Removed pet'}</b><StatusPill s={a.status} /></div>
          <p className="muted small">{a.pet?.breed} · Submitted {fmtDate(a.createdAt)} · Visit {fmtDate(a.visitDate)}</p>
          <Track s={a.status} />
          {a.adminNote && <p className="small"><b>Shelter note:</b> {a.adminNote}</p>}
        </div>
        {a.status === 'Pending' && <button className="btn btn-ghost" onClick={() => setTarget(a._id)}>Cancel</button>}
      </div>)) : <div className="empty"><p>No requests yet.</p><Link to="/adopt" className="btn btn-blue">Find a pet</Link></div>}
  </Load><Confirm open={!!target} danger busy={busy} yes="Cancel request" title="Cancel this request?" text="The pet will become available to other families again." onYes={cancel} onNo={() => setTarget(null)} /></>;
}

function Favs() {
  const { favs } = useFavs(); const r = useFetch('/pets?limit=100');
  const list = (r.data?.pets || []).filter(p => favs.includes(p._id));
  return <><h2>Favourites</h2><Load r={r}>{list.length ? <div className="grid">{list.map(p => <PetCard key={p._id} pet={p} />)}</div> : <div className="empty"><p>Tap the heart on any pet to save it here.</p></div>}</Load></>;
}

function Profile() {
  const { user, updateProfile } = useAuth(); const toast = useToast();
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', city: user.city || '', bio: user.bio || '', password: '' }); const [busy, setBusy] = useState(false);
  const save = async e => { e.preventDefault(); setBusy(true); try { const b = { ...f }; if (!b.password) delete b.password; await updateProfile(b); setF({ ...f, password: '' }); toast('Profile updated.'); } catch (x) { toast(x.message, 'err'); } setBusy(false); };
  const s = k => e => setF({ ...f, [k]: e.target.value });
  return <><h2>My profile</h2><form className="card-form flat" onSubmit={save}><div className="fgrid">
    <label>Name<input value={f.name} onChange={s('name')} /></label><label>Email<input value={user.email} disabled /></label>
    <label>Phone<input value={f.phone} onChange={s('phone')} /></label><label>City<input value={f.city} onChange={s('city')} /></label>
    <label className="full">About you<textarea rows="3" maxLength="300" value={f.bio} onChange={s('bio')} /></label>
    <label className="full">New password (optional)<input type="password" value={f.password} onChange={s('password')} placeholder="Leave blank to keep current" /></label>
  </div><button className="btn btn-blue" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button></form></>;
}

/* ---------- Admin ---------- */
const TXT = [['name', 'Name'], ['breed', 'Breed'], ['age', 'Age (e.g. 2 years)'], ['color', 'Colour'], ['image', 'Image URL'], ['shelterName', 'Shelter name'], ['shelterCity', 'Shelter city'], ['adoptionFee', 'Adoption fee (₹)']];
const LONG = [['description', 'Description'], ['personality', 'Personality (comma separated)'], ['knownIssues', 'Known health issues (verified)'], ['vetNotes', 'Vet notes (verified)'], ['diet', 'Diet'], ['grooming', 'Grooming'], ['exercise', 'Exercise'], ['special', 'Special requirements'], ['general', 'General health advice'], ['safetyNote', 'Safety / legal note'], ['requirements', 'Adoption requirements']];
const toForm = p => ({ name: p.name, category: p.category, breed: p.breed, age: p.age, ageGroup: p.ageGroup, gender: p.gender, size: p.size, color: p.color, image: p.image, status: p.status, adoptionFee: p.adoptionFee, description: p.description, personality: (p.personality || []).join(', '), vaccinated: p.health?.vaccinated, neutered: p.health?.neutered, microchipped: p.health?.microchipped, knownIssues: p.health?.knownIssues, vetNotes: p.health?.vetNotes, diet: p.care?.diet, grooming: p.care?.grooming, exercise: p.care?.exercise, special: p.care?.special, general: p.care?.general, safetyNote: p.safetyNote, requirements: p.requirements, shelterName: p.shelter?.name, shelterCity: p.shelter?.city });
const toPayload = f => ({ name: f.name, category: f.category, breed: f.breed, age: f.age, ageGroup: f.ageGroup, gender: f.gender, size: f.size, color: f.color, image: f.image, status: f.status, adoptionFee: +f.adoptionFee || 0, description: f.description, personality: f.personality.split(',').map(s => s.trim()).filter(Boolean), health: { vaccinated: !!f.vaccinated, neutered: !!f.neutered, microchipped: !!f.microchipped, knownIssues: f.knownIssues || 'None known', vetNotes: f.vetNotes }, care: { diet: f.diet, grooming: f.grooming, exercise: f.exercise, special: f.special, general: f.general }, safetyNote: f.safetyNote, requirements: f.requirements, shelter: { name: f.shelterName, city: f.shelterCity } });
const NEW = { name: '', category: 'Dog', breed: '', age: '', ageGroup: 'Adult', gender: 'Unknown', size: 'Medium', color: '', image: '', status: 'Available', adoptionFee: 0, description: '', personality: '', vaccinated: false, neutered: false, microchipped: false, knownIssues: 'None known', vetNotes: '', diet: '', grooming: '', exercise: '', special: '', general: '', safetyNote: '', requirements: '', shelterName: 'PawHaven Partner Shelter', shelterCity: '' };

function PetForm({ pet, onClose, onSaved }) {
  const toast = useToast(); const [f, setF] = useState(pet ? toForm(pet) : NEW); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const s = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const Sel = (k, label, opts) => <label>{label}<select value={f[k]} onChange={s(k)}>{opts.map(o => <option key={o}>{o}</option>)}</select></label>;
  const save = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api(pet ? '/pets/' + pet._id : '/pets', { method: pet ? 'PUT' : 'POST', body: toPayload(f) }); toast(pet ? 'Pet updated.' : 'Pet added.'); onSaved(); }
    catch (x) { setErr(x.message); } setBusy(false);
  };
  return <Modal open wide onClose={onClose} title={pet ? `Edit ${pet.name}` : 'Add a pet'}><form onSubmit={save} className="pet-form">
    {err && <div className="alert">{err}</div>}
    <div className="fgrid">
      {TXT.map(([k, l]) => <label key={k}>{l}<input value={f[k] ?? ''} onChange={s(k)} required={['name', 'breed', 'age'].includes(k)} /></label>)}
      {Sel('category', 'Category', ['Dog', 'Cat', 'Rabbit', 'Reptile', 'Other'])}{Sel('ageGroup', 'Age group', ['Baby', 'Young', 'Adult', 'Senior'])}
      {Sel('gender', 'Gender', ['Male', 'Female', 'Unknown'])}{Sel('size', 'Size', ['Small', 'Medium', 'Large'])}{Sel('status', 'Status', ['Available', 'Reserved', 'Adopted'])}
      <div className="checks-row full"><b>Verified health record:</b>{['vaccinated', 'neutered', 'microchipped'].map(k => <label key={k} className="inline"><input type="checkbox" checked={!!f[k]} onChange={s(k)} /> {k}</label>)}</div>
      {LONG.map(([k, l]) => <label className="full" key={k}>{l}<textarea rows="2" value={f[k] ?? ''} onChange={s(k)} required={k === 'description'} /></label>)}
    </div>
    <div className="row end gap"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-blue" disabled={busy}>{busy ? 'Saving...' : 'Save pet'}</button></div>
  </form></Modal>;
}

function AdminPets() {
  const r = useFetch('/pets?limit=100'); const toast = useToast(); const [edit, setEdit] = useState(); const [del, setDel] = useState(null); const [q, setQ] = useState('');
  const remove = async () => { try { await api('/pets/' + del._id, { method: 'DELETE' }); toast('Pet deleted.'); r.reload(); } catch (e) { toast(e.message, 'err'); } setDel(null); };
  const setStatus = async (p, status) => { try { await api('/pets/' + p._id, { method: 'PUT', body: { status } }); toast(`${p.name} is now ${status.toLowerCase()}.`); r.reload(); } catch (e) { toast(e.message, 'err'); } };
  const list = (r.data?.pets || []).filter(p => (p.name + p.breed + p.category).toLowerCase().includes(q.toLowerCase()));
  return <><div className="row between wrapx gap"><h2>Manage pets</h2><div className="row gap"><input className="mini-search" placeholder="Filter..." value={q} onChange={e => setQ(e.target.value)} /><button className="btn btn-blue" onClick={() => setEdit(null)}><Icon n="plus" size={18} /> Add pet</button></div></div>
    <Load r={r}><div className="table-wrap"><table><thead><tr><th>Pet</th><th>Category</th><th>Status</th><th>Rating</th><th /></tr></thead><tbody>
      {list.map(p => <tr key={p._id}><td><div className="row gap"><PetImg pet={p} className="thumb" /><div><b>{p.name}</b><br /><span className="muted small">{p.breed}</span></div></div></td><td>{p.category}</td>
        <td><select value={p.status} onChange={e => setStatus(p, e.target.value)} aria-label={`Status of ${p.name}`}><option>Available</option><option>Reserved</option><option>Adopted</option></select></td>
        <td>{p.ratingCount ? p.ratingAvg : '-'}</td>
        <td className="actions"><button className="icon-btn" onClick={() => setEdit(p)} aria-label={`Edit ${p.name}`}><Icon n="edit" size={18} /></button><button className="icon-btn danger" onClick={() => setDel(p)} aria-label={`Delete ${p.name}`}><Icon n="trash" size={18} /></button></td></tr>)}
    </tbody></table></div></Load>
    {edit !== undefined && <PetForm pet={edit} onClose={() => setEdit()} onSaved={() => { setEdit(); r.reload(); }} />}
    <Confirm open={!!del} danger yes="Delete pet" title={`Delete ${del?.name}?`} text="This also removes the pet's adoption requests and reviews." onYes={remove} onNo={() => setDel(null)} /></>;
}

function AdminRequests() {
  const r = useFetch('/adoptions'); const toast = useToast(); const [notes, setNotes] = useState({}); const [view, setView] = useState(null); const [del, setDel] = useState(null);
  const decide = async (a, status) => { try { await api(`/adoptions/${a._id}/status`, { method: 'PUT', body: { status, adminNote: notes[a._id] ?? a.adminNote } }); toast(`Request ${status.toLowerCase()}.`); r.reload(); } catch (e) { toast(e.message, 'err'); } };
  const remove = async () => { try { await api('/adoptions/' + del, { method: 'DELETE' }); toast('Request deleted.'); r.reload(); } catch (e) { toast(e.message, 'err'); } setDel(null); };
  return <><h2>Adoption requests</h2><Load r={r}>{r.data?.adoptions.length ? r.data.adoptions.map(a => (
    <div className="req" key={a._id}>
      {a.pet ? <PetImg pet={a.pet} /> : <div className="thumb-ph" />}
      <div className="grow">
        <div className="row gap wrapx"><b>{a.pet?.name || 'Removed pet'}</b><StatusPill s={a.status} /><span className="muted small">by {a.user?.name} ({a.user?.email})</span></div>
        <p className="small muted">Visit {fmtDate(a.visitDate)} · {a.housing} · {a.experience}</p>
        <div className="row gap wrapx"><input className="note" placeholder="Note to adopter (optional)" defaultValue={a.adminNote} onChange={e => setNotes({ ...notes, [a._id]: e.target.value })} />
          <button className="btn btn-soft" onClick={() => setView(a)}>Details</button>
          {a.status !== 'Approved' && <button className="btn btn-blue" onClick={() => decide(a, 'Approved')}>Approve</button>}
          {a.status !== 'Rejected' && <button className="btn btn-coral" onClick={() => decide(a, 'Rejected')}>Reject</button>}
          <button className="icon-btn danger" onClick={() => setDel(a._id)} aria-label="Delete request"><Icon n="trash" size={18} /></button></div>
      </div></div>)) : <div className="empty"><p>No requests yet.</p></div>}</Load>
    <Modal open={!!view} onClose={() => setView(null)} title="Application details">{view && <div className="detail-list"><p><b>Phone:</b> {view.phone}</p><p><b>Address:</b> {view.address}</p><p><b>Other pets:</b> {view.otherPets || 'None'}</p><p><b>Why they want to adopt:</b> {view.reason}</p></div>}</Modal>
    <Confirm open={!!del} danger yes="Delete" title="Delete this request?" text="If the pet was reserved for it, the pet becomes available again." onYes={remove} onNo={() => setDel(null)} /></>;
}

function AdminUsers() {
  const r = useFetch('/users'); const toast = useToast(); const { user } = useAuth(); const [del, setDel] = useState(null);
  const role = async (u, role) => { try { await api(`/users/${u._id}/role`, { method: 'PUT', body: { role } }); toast('Role updated.'); r.reload(); } catch (e) { toast(e.message, 'err'); } };
  const remove = async () => { try { await api('/users/' + del._id, { method: 'DELETE' }); toast('User deleted.'); r.reload(); } catch (e) { toast(e.message, 'err'); } setDel(null); };
  return <><h2>Users</h2><Load r={r}><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th /></tr></thead><tbody>
    {r.data?.users.map(u => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{fmtDate(u.createdAt)}</td>
      <td><select value={u.role} disabled={u._id === user.id} onChange={e => role(u, e.target.value)} aria-label={`Role of ${u.name}`}><option>user</option><option>admin</option></select></td>
      <td className="actions">{u._id !== user.id && <button className="icon-btn danger" onClick={() => setDel(u)} aria-label={`Delete ${u.name}`}><Icon n="trash" size={18} /></button>}</td></tr>)}
  </tbody></table></div></Load><Confirm open={!!del} danger yes="Delete user" title={`Delete ${del?.name}?`} text="Their requests and reviews are removed too." onYes={remove} onNo={() => setDel(null)} /></>;
}

function AdminMessages() {
  const r = useFetch('/contact'); const toast = useToast();
  const remove = async id => { try { await api('/contact/' + id, { method: 'DELETE' }); toast('Message deleted.'); r.reload(); } catch (e) { toast(e.message, 'err'); } };
  return <><h2>Messages</h2><Load r={r}>{r.data?.messages.length ? r.data.messages.map(m => <div className="req" key={m._id}><div className="grow"><b>{m.subject || 'No subject'}</b> <span className="muted small">from {m.name} ({m.email}) · {fmtDate(m.createdAt)}</span><p>{m.message}</p></div><button className="icon-btn danger" onClick={() => remove(m._id)} aria-label="Delete message"><Icon n="trash" size={18} /></button></div>) : <div className="empty"><p>No messages.</p></div>}</Load></>;
}

export default function Dashboard() {
  const { user } = useAuth(); const admin = user.role === 'admin'; const [tab, setTab] = useState('overview');
  const tabs = admin ? [['overview', 'Overview'], ['pets', 'Manage pets'], ['requests', 'Requests'], ['users', 'Users'], ['messages', 'Messages'], ['profile', 'Profile']] : [['overview', 'Overview'], ['mine', 'My requests'], ['favs', 'Favourites'], ['profile', 'Profile']];
  const View = { overview: () => <Overview admin={admin} />, pets: AdminPets, requests: AdminRequests, users: AdminUsers, messages: AdminMessages, mine: MyRequests, favs: Favs, profile: Profile }[tab];
  return <div className="wrap dash"><aside className="dash-side"><div className="dash-user"><div className="avatar lg">{user.name[0]}</div><b>{user.name}</b><span className="muted small">{admin ? 'Administrator' : 'Adopter'}</span></div>
    <nav>{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</nav></aside>
    <section className="dash-main" key={tab}><View /></section></div>;
}
