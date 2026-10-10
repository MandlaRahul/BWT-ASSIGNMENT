import { Link } from 'react-router-dom';
import { PetImg, useFavs, Icon, Stars } from '../ui.jsx';
import { gShort } from '../constants.js';

export default function PetCard({ pet }) {
  const { has, toggle } = useFavs();
  const on = has(pet._id);
  return (
    <Link to={`/pet/${pet._id}`} className="pcard">
      <PetImg pet={pet} />
      <button className={'fav' + (on ? ' on' : '')} aria-label={on ? 'Remove from favourites' : 'Save to favourites'} aria-pressed={on}
        onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(pet._id); }}>
        <Icon n="heart" size={20} fill={on ? 'currentColor' : 'none'} />
      </button>
      {pet.status !== 'Available' && <span className={'badge ' + pet.status}>{pet.status}</span>}
      <div className="pinfo">
        <h3>{pet.name} <small>({gShort(pet.gender)})</small></h3>
        <p>{pet.age} <i>|</i> {pet.breed}</p>
        <div className="prow"><Stars value={pet.ratingAvg} size={14} /><span>{pet.ratingCount ? `${pet.ratingAvg} (${pet.ratingCount})` : 'New'}</span></div>
      </div>
    </Link>
  );
}
