import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { CATS } from '../constants.js';
import PetCard from '../components/PetCard.jsx';
import { Spinner } from '../ui.jsx';

const blank = { q: '', gender: '', size: '', ageGroup: '', status: '', sort: 'newest' };

export default function Pets({ slug }) {
  const c = CATS[slug];
  const [sp] = useSearchParams();
  const [f, setF] = useState({ ...blank, q: sp.get('q') || '', category: c ? c.cat : sp.get('category') || '' });
  const [data, setData] = useState({ pets: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  useEffect(() => { setF(x => ({ ...x, q: sp.get('q') || '' })); }, [sp]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const p = new URLSearchParams(); Object.entries(f).forEach(([k, v]) => v && p.set(k, v));
      api('/pets?' + p).then(d => { setData(d); setErr(''); }).catch(e => setErr(e.message)).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [f]);

  const set = k => e => setF({ ...f, [k]: e.target.value });
  const dirty = f.q || f.gender || f.size || f.ageGroup || f.status || (!c && f.category);

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>{c ? c.title : 'Adopt a pet'}</h1>
          <p className="lead">{c ? c.caption : 'Give a pet a loving home'}</p>
          <p className="blurb">{c ? c.blurb : 'Search every animal waiting for a family. Narrow by kind, size, age or personality.'}</p>
        </div>
      </section>
      <div className="wrap">
        {!c && (
          <div className="chip-bar" role="tablist" aria-label="Animal type">
            <button className={!f.category ? 'on' : ''} onClick={() => setF({ ...f, category: '' })}>All</button>
            {Object.values(CATS).map(x => <button key={x.cat} className={f.category === x.cat ? 'on' : ''} onClick={() => setF({ ...f, category: x.cat })}>{x.emoji} {x.title}</button>)}
          </div>
        )}
        <div className="toolbar">
          <input type="search" placeholder="Search by name, breed or colour" value={f.q} onChange={set('q')} aria-label="Search" />
          <select value={f.gender} onChange={set('gender')} aria-label="Gender"><option value="">Any gender</option><option>Male</option><option>Female</option></select>
          <select value={f.size} onChange={set('size')} aria-label="Size"><option value="">Any size</option><option>Small</option><option>Medium</option><option>Large</option></select>
          <select value={f.ageGroup} onChange={set('ageGroup')} aria-label="Age"><option value="">Any age</option><option>Baby</option><option>Young</option><option>Adult</option><option>Senior</option></select>
          <select value={f.status} onChange={set('status')} aria-label="Availability"><option value="">All availability</option><option>Available</option><option>Reserved</option><option>Adopted</option></select>
          <select value={f.sort} onChange={set('sort')} aria-label="Sort"><option value="newest">Newest first</option><option value="rating">Top rated</option><option value="name">Name A-Z</option><option value="fee">Lowest fee</option></select>
          {dirty && <button className="btn btn-soft" onClick={() => setF({ ...blank, category: c ? c.cat : '' })}>Clear</button>}
        </div>
        <p className="count" aria-live="polite">{loading ? 'Searching...' : `${data.total} pet${data.total === 1 ? '' : 's'} found`}</p>
        {err && <div className="alert">{err}</div>}
        {loading && !data.pets.length ? <Spinner /> : data.pets.length ? (
          <div className="grid">{data.pets.map(p => <PetCard key={p._id} pet={p} />)}</div>
        ) : !err && (
          <div className="empty"><h3>No pets match your search</h3><p>Try removing a filter, or browse everyone waiting for a home.</p><Link to="/adopt" className="btn btn-blue">See all pets</Link></div>
        )}
      </div>
    </>
  );
}
