export const CATS = {
  dogs: { cat: 'Dog', title: 'Dogs', emoji: '🐕', caption: 'Find a loyal best friend', blurb: 'From playful pups to calm seniors, every dog here is waiting for a sofa spot and a walking partner.' },
  cats: { cat: 'Cat', title: 'Cats', emoji: '🐈', caption: 'Purr-fect companions', blurb: 'Curious climbers, quiet lap cats and chatty talkers. Meet the cat who will choose you.' },
  rabbits: { cat: 'Rabbit', title: 'Rabbits', emoji: '🐇', caption: 'Soft, gentle and full of binkies', blurb: 'Rabbits are social, clever and quietly funny. Learn what they need before you commit.' },
  reptiles: { cat: 'Reptile', title: 'Snakes & Reptiles', emoji: '🐍', caption: 'Fascinating, calm and low-fuss', blurb: 'Snakes, geckos and tortoises need the right setup and local legal clearance. Read each care and safety note first.' },
  others: { cat: 'Other', title: 'Other Animals', emoji: '🐹', caption: 'Small pets, big personalities', blurb: 'Guinea pigs, hamsters, rats and birds make wonderful companions for the right home.' }
};
export const NAV = [['/', 'Home'], ['/dogs', 'Dogs'], ['/cats', 'Cats'], ['/rabbits', 'Rabbits'], ['/reptiles', 'Snakes & Reptiles'], ['/others', 'Other Animals'], ['/adopt', 'Adopt a Pet'], ['/about', 'About Us'], ['/contact', 'Contact Us']];
export const gShort = g => (g === 'Male' ? 'm' : g === 'Female' ? 'f' : '?');
export const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
