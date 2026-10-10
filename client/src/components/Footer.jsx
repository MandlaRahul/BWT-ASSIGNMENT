import { Link } from 'react-router-dom';
import { Logo } from '../ui.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div><Logo light /><p>Adopt love, save a life. Every pet deserves a safe home and every home deserves a loving companion.</p></div>
        <div><h4>Adopt</h4><Link to="/dogs">Dogs</Link><Link to="/cats">Cats</Link><Link to="/rabbits">Rabbits</Link><Link to="/reptiles">Snakes &amp; Reptiles</Link><Link to="/others">Other Animals</Link></div>
        <div><h4>PawHaven</h4><Link to="/about">About us</Link><Link to="/contact">Contact us</Link><Link to="/dashboard">My dashboard</Link><Link to="/login">Login</Link></div>
        <div><h4>Please note</h4><p className="small">Health details marked "verified" come from the shelter vet. Care tips are general advice only. Always consult a qualified veterinarian for health concerns.</p></div>
      </div>
      <div className="foot-bottom">© {new Date().getFullYear()} PawHaven. Made with love for animals.</div>
    </footer>
  );
}
