import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { CATS, gShort } from '../constants.js';
import { Icon, PetImg, Spinner } from '../ui.jsx';
import PetCard from '../components/PetCard.jsx';

// Interleave categories so the hero fan shows variety
function mix(pets, n = 8) {
  const g = {}; pets.forEach(p => (g[p.category] = g[p.category] || []).push(p));
  const out = []; let i = 0;
  while (out.length < n && Object.values(g).some(a => a[i])) { Object.values(g).forEach(a => a[i] && out.length < n && out.push(a[i])); i++; }
  return out;
}

function Fan({ pets }) {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = pets.length;
  useEffect(() => { if (paused || n < 7) return; const t = setInterval(() => setI(x => x + 1), 3800); return () => clearInterval(t); }, [paused, n]);
  if (n < 7) return null;
  return (
    <div className="fan" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {[-3, -2, -1, 0, 1, 2, 3].map(o => {
        const p = pets[(((i + o) % n) + n) % n];
        return (
          <article key={p._id} className={'fan-card o' + (o < 0 ? 'm' + -o : o)} onClick={() => (o === 0 ? nav('/pet/' + p._id) : setI(i + o))}
            tabIndex={o === 0 ? 0 : -1} aria-hidden={Math.abs(o) > 1} onKeyDown={e => e.key === 'Enter' && o === 0 && nav('/pet/' + p._id)}>
            <div className="fan-img"><PetImg pet={p} /><span className="tag-corner">{p.shelter?.city || 'Shelter'}</span></div>
            <h3>{p.name}</h3>
            <div className="chips"><span>{p.breed}</span><span>{p.gender}</span><span>{p.age}</span></div>
            <div className="fan-foot"><Icon n="pin" size={14} /> {p.shelter?.name}</div>
          </article>
        );
      })}
    </div>
  );
}

function PetRow({ slug }) {
  const c = CATS[slug]; const ref = useRef(); const [pets, setPets] = useState(null);
  useEffect(() => { api(`/pets?category=${c.cat}&sort=rating&limit=8`).then(d => setPets(d.pets)).catch(() => setPets([])); }, [c.cat]);
  const go = d => ref.current.scrollBy({ left: d * 340, behavior: 'smooth' });
  if (pets && !pets.length) return null;
  return (
    <section className="wrap row-sec">
      <div className="row-head">
        <h2>Find {c.title} <span aria-hidden>{c.emoji}</span></h2>
        <div className="row gap">
          <Link to={'/' + slug} className="btn btn-soft">See more</Link>
          <button className="round" onClick={() => go(-1)} aria-label="Scroll left"><Icon n="left" /></button>
          <button className="round" onClick={() => go(1)} aria-label="Scroll right"><Icon n="right" /></button>
        </div>
      </div>
      {!pets ? <Spinner /> : <div className="hscroll" ref={ref}>{pets.map(p => <PetCard key={p._id} pet={p} />)}</div>}
    </section>
  );
}

const STEPS = [
  ['search', 'Find a pet', 'Browse dogs, cats, rabbits, reptiles and more. Filter by size, age and temperament.'],
  ['heart', 'Submit an application', 'Tell us about your home and experience. Your chosen pet is held for you while we review.'],
  ['chat', 'Meet and greet', 'Visit the shelter on the date you choose and spend time with your new friend.'],
  ['home', 'Welcome your pet', 'Once approved, take your companion home with their full health records.']
];

export default function Home() {
  const [pets, setPets] = useState([]);
  const [stats, setStats] = useState(null);
  const [tiles, setTiles] = useState({});
  useEffect(() => {
    api('/pets?status=Available&sort=rating&limit=60').then(d => {
      setPets(mix(d.pets));
      const t = {}; d.pets.forEach(p => { if (!t[p.category]) t[p.category] = p; }); setTiles(t);
    }).catch(() => {});
    api('/pets/stats').then(setStats).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-in">
          <h1 className="hero-title"><i /><span>Find your perfect companion</span><i /></h1>
          <p className="hero-sub">Give a pet a loving home. Adopt love, save a life.</p>
          {pets.length >= 7 ? <Fan pets={pets} /> : <div style={{ height: 120 }} />}
          <div className="hero-cta">
            <Link to="/adopt" className="btn btn-white btn-lg">Explore pets now</Link>
            <Link to="/signup" className="btn btn-amber btn-lg">Create free account</Link>
          </div>
        </div>
      </section>

      <section className="wrap statement">
        <h2>Adopt love.<br />Save a life.</h2>
        <div className="heart-rule"><i /><Icon n="heart" size={26} fill="currentColor" /><i /></div>
        <p>Every adoption opens a space in a shelter for the next animal in need. Choose a companion who fits your life, and give them a home for good.</p>
        {stats && <div className="stats"><div><b>{stats.available}</b><span>waiting for homes</span></div><div><b>{stats.adopted}</b><span>happily adopted</span></div><div><b>{Object.keys(stats.byCategory).length}</b><span>kinds of animals</span></div></div>}
      </section>

      <section className="wrap">
        <div className="sec-head"><h2>Who are you looking for?</h2><p>Pick a family of animals to start your search.</p></div>
        <div className="tiles">
          {Object.entries(CATS).map(([slug, c]) => (
            <Link key={slug} to={'/' + slug} className="tile">
              {tiles[c.cat] ? <PetImg pet={tiles[c.cat]} /> : <div className="tile-ph">{c.emoji}</div>}
              <div className="tile-label"><b>{c.title}</b><span>{stats?.byCategory?.[c.cat] || 0} pets</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="how">
        <div className="wrap">
          <div className="sec-head"><h2>How to adopt</h2><p>Four simple steps from first look to forever home.</p></div>
          <div className="steps">{STEPS.map(([ic, t, d]) => <div className="step" key={t}><span className="step-ic"><Icon n={ic} size={34} /></span><h3>{t}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>

      {['dogs', 'cats', 'rabbits', 'reptiles', 'others'].map(s => <PetRow key={s} slug={s} />)}

      <section className="wrap care">
        <div className="care-box verified">
          <Icon n="shield" size={30} /><h3>Verified medical information</h3>
          <p>Vaccinations, neutering, microchips and known conditions on every profile come from the shelter vet's records.</p>
        </div>
        <div className="care-box">
          <Icon n="heart" size={30} /><h3>General care advice</h3>
          <p>Diet, grooming and exercise tips are helpful guidance for the species, not medical advice. Please consult a qualified veterinarian for any health concern.</p>
        </div>
      </section>

      <section className="wrap cta-band">
        <div><h2>A loving home is the best gift you can give.</h2><p>Your next best friend is a few clicks away.</p></div>
        <Link to="/adopt" className="btn btn-blue btn-lg">Browse all pets</Link>
      </section>
    </>
  );
}
