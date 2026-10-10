// Run: npm run seed   (clears pets/adoptions/reviews and recreates demo data)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Pet = require('./models/Pet');
const Adoption = require('./models/Adoption');
const Review = require('./models/Review');

const CARE = {
  Dog: { diet: 'Balanced, high-quality dog food in two meals a day; fresh water always.', grooming: 'Brush weekly, bathe every 4-8 weeks, trim nails monthly.', exercise: '30-90 minutes of walks and play every day.', special: 'Needs a secure fence or leash, basic training and early socialisation.', general: 'Yearly vet check-up, regular flea, tick and worm prevention.' },
  Cat: { diet: 'Complete wet and dry cat food; never feed dog food. Fresh water daily.', grooming: 'Brush a few times a week (daily for long coats); check ears and teeth.', exercise: 'Daily interactive play, a scratching post and window perches.', special: 'Keep indoors or supervised outdoors; one litter tray per cat plus one spare.', general: 'Yearly vet check-up and dental care.' },
  Rabbit: { diet: 'Unlimited hay, a small portion of pellets and fresh leafy greens. Limit sugary treats.', grooming: 'Brush weekly, more often during moulting; trim nails every 6-8 weeks.', exercise: 'At least 3-4 hours a day outside the hutch in a safe, rabbit-proofed area.', special: 'Best kept in bonded pairs; rabbits are fragile and should not be picked up by the ears.', general: 'Yearly vet check-up with a rabbit-savvy vet; watch for loss of appetite, which is urgent.' },
  Reptile: { diet: 'Species-appropriate whole prey or insects, fed on a schedule suited to age and size.', grooming: 'No grooming; keep enclosure clean and spot-clean waste daily.', exercise: 'Enrichment such as hides, climbing branches and safe handling sessions.', special: 'Needs correct heat gradient, humidity, UV (where needed) and a locked, escape-proof enclosure.', general: 'Find an exotics vet before adoption; wash hands after every handling session.' },
  Other: { diet: 'Species-specific diet from your vet or shelter care sheet; fresh water daily.', grooming: 'Light grooming and regular cage or habitat cleaning.', exercise: 'Daily time outside the cage and plenty of enrichment.', special: 'Needs a correctly sized habitat, a quiet spot and gentle handling.', general: 'Regular check-ups with a vet experienced in small or exotic pets.' }
};
const SHELTERS = [['Paws & Hearts Shelter', 'Hyderabad'], ['Happy Tails Rescue', 'Bengaluru'], ['Safe Haven Animal Home', 'Mumbai']];
const SNAKE_SAFETY = 'Snakes are not suited to every home. Never handle right after feeding, always use a locked enclosure, and learn the species\' needs before adopting. Check your local wildlife and exotic-pet laws; adoption is only approved where legal.';

// name, category, breed, age, ageGroup, gender, size, color, image keywords, personality, description, [known issue]
const P = [
  ['Buddy', 'Dog', 'Golden Retriever', '2 years', 'Young', 'Male', 'Large', 'Golden', 'golden,retriever,dog', ['Friendly', 'Playful', 'Great with kids'], 'Buddy greets everyone like an old friend. He loves fetch, swimming and belly rubs, and is already house-trained.'],
  ['Luna', 'Dog', 'Siberian Husky', '3 years', 'Adult', 'Female', 'Large', 'Grey & white', 'siberian,husky', ['Energetic', 'Vocal', 'Adventurous'], 'Luna has striking blue eyes and boundless energy. She needs an active family who enjoys long runs and hikes.', 'Mild seasonal skin sensitivity'],
  ['Max', 'Dog', 'German Shepherd', '4 years', 'Adult', 'Male', 'Large', 'Black & tan', 'german,shepherd', ['Loyal', 'Smart', 'Protective'], 'Max is a calm, intelligent shepherd who knows basic commands and thrives with a confident, consistent owner.', 'Early hip monitoring recommended'],
  ['Daisy', 'Dog', 'Beagle', '1 year', 'Young', 'Female', 'Medium', 'Tricolour', 'beagle,puppy', ['Curious', 'Gentle', 'Food-motivated'], 'Daisy follows her nose everywhere. She is sweet, sociable and does well with other dogs.'],
  ['Rocky', 'Dog', 'Labrador Retriever', '5 years', 'Adult', 'Male', 'Large', 'Chocolate', 'chocolate,labrador', ['Easygoing', 'Affectionate', 'Eager to please'], 'Rocky is a gentle chocolate Lab who loves cuddles on the sofa as much as a walk in the park.', 'Mild hip dysplasia, managed with supplements'],
  ['Coco', 'Dog', 'Pug', '3 years', 'Adult', 'Female', 'Small', 'Fawn', 'pug,dog', ['Cuddly', 'Funny', 'Lap-loving'], 'Coco is a snuggly pug with a big personality. She is happiest in a cool home with someone around most of the day.', 'Flat-faced breed: avoid heat and heavy exercise'],
  ['Mowgli', 'Dog', 'Indian Pariah Dog', '8 months', 'Baby', 'Male', 'Medium', 'Sandy brown', 'indian,pariah,dog', ['Hardy', 'Clever', 'Loyal'], 'Rescued from the streets, Mowgli is a bright, healthy desi pup who learns fast and bonds deeply with his people.'],
  ['Whiskers', 'Cat', 'Persian', '4 years', 'Adult', 'Male', 'Medium', 'White', 'persian,cat', ['Calm', 'Regal', 'Affectionate'], 'Whiskers is a calm, fluffy Persian who enjoys quiet afternoons and daily brushing sessions.', 'Tear staining; eyes checked every 6 months'],
  ['Oliver', 'Cat', 'Maine Coon', '2 years', 'Young', 'Male', 'Large', 'Brown tabby', 'maine,coon,cat', ['Gentle giant', 'Sociable', 'Playful'], 'Oliver is a big, fluffy gentle giant who follows people from room to room and loves puzzle toys.', 'Heart screened (HCM): clear'],
  ['Mia', 'Cat', 'Siamese', '1 year', 'Young', 'Female', 'Small', 'Cream & seal point', 'siamese,cat', ['Chatty', 'Clever', 'Social'], 'Mia talks to you all day and loves to play. She would love a home where she is not left alone for long.'],
  ['Simba', 'Cat', 'Bengal', '3 years', 'Adult', 'Male', 'Medium', 'Golden spotted', 'bengal,cat', ['Athletic', 'Curious', 'Bold'], 'Simba has a leopard-like coat and loves climbing. He needs tall cat trees and plenty of play.'],
  ['Shadow', 'Cat', 'British Shorthair', '6 years', 'Senior', 'Male', 'Medium', 'Blue-grey', 'british,shorthair,cat', ['Quiet', 'Loyal', 'Relaxed'], 'Shadow is a mellow older gentleman who wants a warm lap and a peaceful home.', 'Early kidney values monitored; special diet advised'],
  ['Snowball', 'Rabbit', 'Holland Lop', '1 year', 'Young', 'Female', 'Small', 'White', 'white,lop,rabbit', ['Sweet', 'Calm', 'Cuddly'], 'Snowball has soft floppy ears and loves being stroked. She is litter-trained and gentle with respectful children.'],
  ['Thumper', 'Rabbit', 'Netherland Dwarf', '2 years', 'Young', 'Male', 'Small', 'Grey agouti', 'dwarf,rabbit', ['Lively', 'Shy at first', 'Curious'], 'Thumper is tiny and speedy. He takes a little time to trust, then becomes a loving binky-jumping companion.'],
  ['Clover', 'Rabbit', 'Mini Rex', '8 months', 'Baby', 'Female', 'Small', 'Chocolate', 'rex,rabbit', ['Velvety coat', 'Friendly', 'Active'], 'Clover has an ultra-soft velvety coat and loves exploring. She would love a spacious, rabbit-proofed home.'],
  ['Biscuit', 'Rabbit', 'Lionhead', '3 years', 'Adult', 'Male', 'Small', 'Tan & white', 'lionhead,rabbit', ['Fluffy', 'Gentle', 'Relaxed'], 'Biscuit sports a fluffy mane and an easygoing nature. He needs regular brushing to keep his coat tangle-free.', 'Occasional dental overgrowth; hay-rich diet essential'],
  ['Slinky', 'Reptile', 'Ball Python', '3 years', 'Adult', 'Female', 'Medium', 'Brown & gold', 'ball,python,snake', ['Docile', 'Shy', 'Calm'], 'Slinky is a calm, captive-bred ball python who tolerates gentle, confident handling and eats frozen-thawed rodents.', 'None known', SNAKE_SAFETY],
  ['Kenzo', 'Reptile', 'Corn Snake', '2 years', 'Young', 'Male', 'Medium', 'Orange & red', 'corn,snake', ['Curious', 'Easy to handle', 'Active'], 'Kenzo is a captive-bred corn snake, often recommended for first-time snake keepers thanks to his calm temperament.', 'None known', SNAKE_SAFETY],
  ['Jade', 'Reptile', 'California Kingsnake', '4 years', 'Adult', 'Female', 'Medium', 'Black & white banded', 'kingsnake,snake', ['Bold', 'Hardy', 'Alert'], 'Jade is a hardy kingsnake with striking bands. She suits keepers with some reptile experience.', 'None known', SNAKE_SAFETY],
  ['Leo', 'Reptile', 'Leopard Gecko', '2 years', 'Young', 'Male', 'Small', 'Yellow spotted', 'leopard,gecko', ['Gentle', 'Nocturnal', 'Easy-going'], 'Leo is a friendly leopard gecko who is easy to care for and great for patient first-time reptile owners.', 'Healed tail tip (old injury)'],
  ['Shelly', 'Reptile', 'Russian Tortoise', '10 years', 'Adult', 'Female', 'Small', 'Olive & brown', 'tortoise', ['Steady', 'Curious', 'Long-lived'], 'Shelly is a charming tortoise who can live for decades. She needs a spacious enclosure with UVB light and a calcium-rich diet.'],
  ['Peanut', 'Other', 'Guinea Pig', '1 year', 'Young', 'Male', 'Small', 'Brown & white', 'guinea,pig', ['Chatty', 'Social', 'Gentle'], 'Peanut squeaks happily when he hears the fridge door. Guinea pigs do best in pairs, so ask us about his bonded friend.'],
  ['Kiwi', 'Other', 'Cockatiel', '3 years', 'Adult', 'Male', 'Small', 'Grey with yellow crest', 'cockatiel,bird', ['Whistler', 'Affectionate', 'Social'], 'Kiwi whistles tunes and loves head scratches. He needs daily out-of-cage time and company.', 'None known'],
  ['Nibbles', 'Other', 'Syrian Hamster', '6 months', 'Baby', 'Female', 'Small', 'Golden', 'syrian,hamster', ['Busy', 'Curious', 'Nocturnal'], 'Nibbles is an active little hamster who loves her wheel and tunnels. She is best kept alone and handled gently.'],
  ['Pepper', 'Other', 'Fancy Rat', '1 year', 'Young', 'Female', 'Small', 'Black & white', 'fancy,rat,pet', ['Smart', 'Affectionate', 'Trainable'], 'Pepper is a clever rat who learns tricks and loves riding on shoulders. Rats need friends, so we suggest adopting two.']
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pawhaven');
  await Promise.all([Pet.deleteMany(), Adoption.deleteMany(), Review.deleteMany()]);
  const hash = await bcrypt.hash('Admin@123', 10);
  await User.updateOne({ email: 'admin@pawhaven.com' }, { name: 'PawHaven Admin', email: 'admin@pawhaven.com', password: hash, role: 'admin' }, { upsert: true });
  await User.updateOne({ email: 'demo@pawhaven.com' }, { name: 'Demo Adopter', email: 'demo@pawhaven.com', password: await bcrypt.hash('Demo@123', 10), role: 'user' }, { upsert: true });

  const docs = P.map((p, i) => {
    const [name, category, breed, age, ageGroup, gender, size, color, kw, personality, description, issue, safety] = p;
    const sh = SHELTERS[i % 3];
    const isReptile = category === 'Reptile';
    return {
      name, category, breed, age, ageGroup, gender, size, color, personality, description,
      image: `https://loremflickr.com/800/600/${kw}?lock=${i + 11}`,
      health: {
        vaccinated: !isReptile && category !== 'Other', neutered: ['Dog', 'Cat', 'Rabbit'].includes(category) && ageGroup !== 'Baby',
        microchipped: ['Dog', 'Cat'].includes(category), knownIssues: issue || 'None known',
        vetNotes: `Health check completed by ${sh[0]} vet on ${new Date().toISOString().slice(0, 10)}. Full records provided on adoption.`
      },
      care: CARE[category], safetyNote: safety || '',
      requirements: isReptile ? 'Properly heated, locked enclosure ready before pick-up; home visit required.' : 'Home check, valid ID and a signed adoption agreement. Adopters must be 18 or older.',
      shelter: { name: sh[0], city: sh[1] }, adoptionFee: category === 'Dog' || category === 'Cat' ? 1500 : 500,
      status: i % 9 === 8 ? 'Adopted' : 'Available'
    };
  });
  await Pet.insertMany(docs);
  console.log(`Seeded ${docs.length} pets.\nAdmin: admin@pawhaven.com / Admin@123\nUser:  demo@pawhaven.com / Demo@123`);
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
