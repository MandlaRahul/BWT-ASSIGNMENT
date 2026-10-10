import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, useFetch } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { Icon, PetImg, Spinner, Stars, StarInput, StatusPill, useFavs, useToast, Confirm } from '../ui.jsx';
import { fmtDate } from '../constants.js';

const Yes = ({ v, label }) => <li className={v ? 'yes' : 'no'}><Icon n={v ? 'check' : 'close'} size={16} /> {label}</li>;

export default function PetDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { has, toggle } = useFavs();
  const { data, err, loading } = useFetch('/pets/' + id);
  const rev = useFetch('/reviews/pet/' + id);
  const [tab, setTab] = useState('about');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);
  const [pet, setPet] = useState(null);
  useEffect(() => { if (data) setPet(data.pet); }, [data]);

  if (loading) return <Spinner />;
  if (err || !pet) return <div className="wrap empty"><h2>Pet not found</h2><p>{err}</p><Link className="btn btn-blue" to="/adopt">Browse pets</Link></div>;

  const refreshPet = () => api('/pets/' + id).then(d => setPet(d.pet));
  const submitReview = async e => {
    e.preventDefault();
    if (!user) return nav('/login', { state: { from: '/pet/' + id } });
    setBusy(true);
    try { await api('/reviews/pet/' + id, { method: 'POST', body: { rating, comment } }); toast('Thanks! Your review is posted.'); setComment(''); setRating(0); rev.reload(); refreshPet(); }
    catch (e2) { toast(e2.message, 'err'); } finally { setBusy(false); }
  };
  const removeReview = async () => {
    try { await api('/reviews/' + del, { method: 'DELETE' }); toast('Review deleted.'); rev.reload(); refreshPet(); } catch (e2) { toast(e2.message, 'err'); }
    setDel(null);
  };
  const adopt = () => user ? nav('/adopt/' + pet._id) : nav('/login', { state: { from: '/adopt/' + pet._id } });
  const h = pet.health || {}, c = pet.care || {};
  const facts = [['Breed', pet.breed], ['Age', `${pet.age} (${pet.ageGroup})`], ['Gender', pet.gender], ['Size', pet.size], ['Colour', pet.color || '-'], ['Adoption fee', pet.adoptionFee ? `₹${pet.adoptionFee}` : 'Free']];

  return (
    <div className="wrap detail">
      <Link to="/adopt" className="back"><Icon n="left" size={18} /> All pets</Link>
      <div className="detail-top">
        <div className="detail-img">
          <PetImg pet={pet} loading="eager" />
          <button className={'fav lg' + (has(pet._id) ? ' on' : '')} onClick={() => toggle(pet._id)} aria-label="Save to favourites"><Icon n="heart" fill={has(pet._id) ? 'currentColor' : 'none'} /></button>
        </div>
        <div className="detail-side">
          <div className="row gap wrapx"><StatusPill s={pet.status} /><span className="muted">{pet.category}</span></div>
          <h1>{pet.name}</h1>
          <p className="lead-sm">{pet.breed}</p>
          <div className="row gap"><Stars value={pet.ratingAvg} /><span className="muted">{pet.ratingCount ? `${pet.ratingAvg} from ${pet.ratingCount} review${pet.ratingCount > 1 ? 's' : ''}` : 'No reviews yet'}</span></div>
          <dl className="facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <div className="chips">{pet.personality?.map(t => <span key={t}>{t}</span>)}</div>
          <p className="muted small"><Icon n="pin" size={14} /> {pet.shelter?.name}{pet.shelter?.city ? `, ${pet.shelter.city}` : ''}</p>
          {pet.status === 'Available'
            ? <button className="btn btn-amber btn-lg block" onClick={adopt}>Adopt {pet.name}</button>
            : <div className="notice">{pet.name} is currently <b>{pet.status.toLowerCase()}</b>. {pet.status === 'Reserved' ? 'Another family has a pending request. Check back soon.' : 'Browse other pets waiting for a home.'}</div>}
        </div>
      </div>

      <div className="tabs" role="tablist">
        {[['about', 'About'], ['health', 'Health'], ['care', 'Care'], ['reviews', `Reviews (${pet.ratingCount})`]].map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      <div className="panel" key={tab}>
        {tab === 'about' && <>
          <h3>Meet {pet.name}</h3><p>{pet.description}</p>
          <h3>Adoption requirements</h3><p>{pet.requirements || 'Valid ID and a signed adoption agreement.'}</p>
          {pet.safetyNote && <div className="notice warn"><b>Safety and legal note.</b> {pet.safetyNote}</div>}
        </>}
        {tab === 'health' && <div className="two">
          <div className="care-box verified"><Icon n="shield" size={26} /><h3>Verified medical record</h3><p className="small muted">Recorded by the shelter vet.</p>
            <ul className="checks"><Yes v={h.vaccinated} label="Vaccinated" /><Yes v={h.neutered} label="Neutered / spayed" /><Yes v={h.microchipped} label="Microchipped" /></ul>
            <p><b>Known issues:</b> {h.knownIssues || 'None known'}</p>
            {h.vetNotes && <p><b>Vet notes:</b> {h.vetNotes}</p>}</div>
          <div className="care-box"><Icon n="heart" size={26} /><h3>General care advice</h3><p className="small muted">Guidance for this kind of animal, not a medical record.</p>
            <p><b>General health:</b> {c.general}</p><p className="small muted">Always consult a qualified veterinarian about any health concern.</p></div>
        </div>}
        {tab === 'care' && <>
          <div className="care-grid">{[['Diet', c.diet], ['Grooming', c.grooming], ['Exercise and enrichment', c.exercise], ['Special requirements', c.special]].map(([k, v]) => <div key={k} className="care-item"><h4>{k}</h4><p>{v}</p></div>)}</div>
          <p className="muted small">This is general care advice for the species. It is not a substitute for guidance from a qualified veterinarian.</p>
          {pet.safetyNote && <div className="notice warn"><b>Safety and legal note.</b> {pet.safetyNote}</div>}
        </>}
        {tab === 'reviews' && <>
          <form className="review-form" onSubmit={submitReview}>
            <h3>Rate {pet.name} or your adoption experience</h3>
            <StarInput value={rating} onChange={setRating} />
            <textarea rows="3" maxLength="500" placeholder="Share what you liked..." value={comment} onChange={e => setComment(e.target.value)} />
            <button className="btn btn-blue" disabled={busy || !rating || comment.trim().length < 3}>{busy ? 'Posting...' : user ? 'Post review' : 'Log in to review'}</button>
          </form>
          {rev.loading ? <Spinner /> : rev.data?.reviews.length ? rev.data.reviews.map(r => (
            <div className="review" key={r._id}>
              <div className="avatar">{r.user?.name?.[0] || '?'}</div>
              <div className="grow"><b>{r.user?.name || 'Former user'}</b> <span className="muted small">{fmtDate(r.createdAt)}</span><br /><Stars value={r.rating} size={14} /><p>{r.comment}</p></div>
              {user && (user.id === r.user?._id || user.role === 'admin') && <button className="icon-btn" onClick={() => setDel(r._id)} aria-label="Delete review"><Icon n="trash" size={18} /></button>}
            </div>)) : <p className="muted">No reviews yet. Be the first to share your thoughts.</p>}
        </>}
      </div>
      <Confirm open={!!del} danger yes="Delete review" title="Delete this review?" text="This cannot be undone." onYes={removeReview} onNo={() => setDel(null)} />
    </div>
  );
}
