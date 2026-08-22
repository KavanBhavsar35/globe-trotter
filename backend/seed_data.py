# Comprehensive seed catalog with INR pricing
# Cities + activities grouped by country, plus dummy users and public itineraries
# Scope: Japan, United Kingdom, India (expanded with more destinations)

from sqlmodel import select
from datetime import date, timedelta

# (city_name, country, cost_index_inr_per_night, popularity_0_100, [ (activity, type, cost_inr, hours, description) ... ])
CITIES = [
    # ---------- Japan (10 cities) ----------
    ("Tokyo", "Japan", 8500, 98, [
        ("Senso-ji Temple, Asakusa", "culture", 0, 2, "Tokyo's oldest temple, framed by the Kaminarimon gate and a lively market street."),
        ("Shibuya & Shinjuku Walk", "sightseeing", 0, 3, "Neon crossings, backstreet izakayas and the pulse of the world's busiest districts."),
        ("Sushi Omakase Dinner", "food", 9500, 2, "Chef's-choice sushi served piece by piece at the counter."),
        ("teamLab Planets Digital Art", "culture", 2800, 3, "Wade through immersive, water-and-light digital art rooms."),
        ("Meiji Shrine Visit", "culture", 0, 1, "Peaceful shrine in a forested sanctuary near Harajuku."),
        ("Tokyo Skytree Observatory", "sightseeing", 2100, 2, "Panoramic views from Japan's tallest tower."),
        ("Tsukiji Outer Market Food Tour", "food", 3500, 3, "Fresh seafood and street food in Tokyo's famous market."),
        ("Akihabara Electronics District", "sightseeing", 0, 2, "Anime, manga and cutting-edge electronics in Electric Town."),
    ]),
    ("Kyoto", "Japan", 7200, 95, [
        ("Fushimi Inari Shrine", "culture", 0, 3, "Hike the tunnel of thousands of vermilion torii gates up the mountain."),
        ("Arashiyama Bamboo Grove", "nature", 0, 2, "Walk the towering bamboo path and riverside temples on the city's west edge."),
        ("Traditional Tea Ceremony", "culture", 3600, 1, "Learn the ritual of matcha in a tatami tea room."),
        ("Kaiseki Multi-course Dinner", "food", 7200, 2, "Seasonal, artfully plated Japanese haute cuisine."),
        ("Kinkaku-ji Golden Pavilion", "culture", 400, 1, "Stunning gold-leaf covered temple reflected in its pond."),
        ("Gion Geisha District Walk", "culture", 0, 2, "Traditional wooden machiya houses and possible geisha sightings."),
        ("Nishiki Market Food Tour", "food", 2500, 2, "Kyoto's kitchen with local delicacies and pickles."),
    ]),
    ("Osaka", "Japan", 6800, 90, [
        ("Osaka Castle", "sightseeing", 1200, 2, "Iconic hilltop keep set in a moat and cherry-tree park."),
        ("Dotonbori Street Food Crawl", "food", 3200, 2, "Takoyaki, okonomiyaki and neon signs along the canal."),
        ("Universal Studios Japan", "adventure", 6400, 8, "Big-ticket theme park with Nintendo World and thrill rides."),
        ("Umeda Sky Building", "sightseeing", 1600, 1, "Floating rooftop observatory with 360° city views."),
        ("Kuromon Market", "food", 2800, 2, "Fresh seafood and local street food in covered arcade."),
        ("Osaka Aquarium Kaiyukan", "adventure", 2400, 3, "One of the world's largest aquariums with whale sharks."),
    ]),
    ("Hiroshima", "Japan", 5800, 78, [
        ("Peace Memorial Park & Museum", "culture", 0, 2, "Moving memorial and museum on the site of the 1945 bombing."),
        ("Miyajima Island & Floating Torii", "nature", 2000, 5, "Ferry to the island shrine whose great gate stands in the sea."),
        ("Okonomiyaki Tasting", "food", 1600, 1, "Hiroshima-style layered savoury pancake cooked on the griddle."),
        ("Shukkeien Garden", "nature", 260, 1, "Historic Japanese garden with scenic walking paths."),
    ]),
    ("Sapporo", "Japan", 6200, 72, [
        ("Sapporo Beer Museum", "food", 800, 2, "Japan's oldest beer brand, with tastings in a red-brick hall."),
        ("Odori Park Stroll", "nature", 0, 1, "Green ribbon through downtown, host of the famous snow festival."),
        ("Susukino Nightlife", "nightlife", 4000, 3, "Hokkaido's biggest entertainment quarter after dark."),
        ("Moerenuma Park", "nature", 0, 2, "Art park designed by sculptor Isamu Noguchi."),
        ("Hokkaido Ramen Tour", "food", 2400, 2, "Rich miso ramen in Sapporo's legendary ramen alleys."),
    ]),
    ("Nara", "Japan", 5400, 85, [
        ("Nara Park Deer Feeding", "nature", 150, 2, "Feed friendly wild deer roaming the historic park."),
        ("Todai-ji Temple & Great Buddha", "culture", 600, 2, "Massive bronze Buddha in one of the world's largest wooden buildings."),
        ("Kasuga Taisha Shrine", "culture", 500, 1, "Ancient shrine lined with thousands of stone lanterns."),
        ("Naramachi Old Town", "sightseeing", 0, 2, "Preserved merchant quarter with traditional houses."),
    ]),
    ("Hakone", "Japan", 9500, 82, [
        ("Lake Ashi Cruise", "nature", 1000, 1, "Scenic boat ride with views of Mt. Fuji."),
        ("Hakone Open-Air Museum", "culture", 1600, 2, "Sculpture park with Picasso pavilion."),
        ("Owakudani Valley Hot Springs", "nature", 0, 2, "Active volcanic valley with black eggs boiled in sulfur springs."),
        ("Traditional Ryokan Stay", "relax", 12000, 12, "Overnight in a Japanese inn with kaiseki dinner and onsen."),
    ]),
    ("Takayama", "Japan", 6800, 76, [
        ("Takayama Old Town", "culture", 0, 2, "Beautifully preserved Edo-period streets with sake breweries."),
        ("Morning Market", "food", 800, 1, "Local produce and crafts at riverside morning market."),
        ("Hida Folk Village", "culture", 700, 2, "Open-air museum of traditional farmhouses."),
        ("Hida Beef Dining", "food", 4500, 2, "Premium marbled beef from the Hida region."),
    ]),
    ("Nikko", "Japan", 6500, 80, [
        ("Toshogu Shrine", "culture", 1300, 2, "Lavishly decorated shrine complex, a UNESCO World Heritage site."),
        ("Kegon Falls", "nature", 550, 1, "97-meter waterfall near Lake Chuzenji."),
        ("Lake Chuzenji Cruise", "nature", 1200, 1, "Scenic lake cruise in the mountains."),
        ("Edo Wonderland Theme Park", "adventure", 4700, 4, "Ninja and samurai theme park recreating Edo period."),
    ]),
    ("Kamakura", "Japan", 6000, 78, [
        ("Great Buddha (Daibutsu)", "culture", 200, 1, "Massive bronze Buddha statue from 1252."),
        ("Hasedera Temple", "culture", 400, 1, "Hillside temple with ocean views and beautiful gardens."),
        ("Komachi-dori Shopping Street", "sightseeing", 0, 2, "Bustling street with shops and food stalls."),
        ("Enoshima Island", "nature", 0, 3, "Island with shrines, caves, and coastal views."),
    ]),

    # ---------- United Kingdom (10 cities) ----------
    ("London", "United Kingdom", 12000, 97, [
        ("Tower of London", "culture", 2800, 3, "Historic fortress guarding the Crown Jewels, led by the Beefeaters."),
        ("British Museum", "culture", 0, 3, "World treasures from the Rosetta Stone to the Parthenon marbles."),
        ("West End Theatre Show", "nightlife", 7200, 3, "A night at one of the world's great theatre districts."),
        ("Borough Market Food Tour", "food", 3600, 2, "Graze artisan stalls at London's most storied food market."),
        ("London Eye", "sightseeing", 2400, 1, "Iconic observation wheel with Thames views."),
        ("Westminster Abbey", "culture", 2000, 2, "Gothic abbey where monarchs are crowned."),
        ("Camden Market", "sightseeing", 0, 3, "Eclectic market with street food and vintage finds."),
        ("Thames River Cruise", "nature", 1600, 1, "Sightseeing cruise along the historic river."),
    ]),
    ("Edinburgh", "United Kingdom", 9000, 88, [
        ("Edinburgh Castle", "culture", 2000, 2, "Clifftop fortress over the city, home of the Stone of Destiny."),
        ("Royal Mile Walk", "sightseeing", 0, 2, "Cobbled spine of the Old Town from castle to palace."),
        ("Arthur's Seat Hike", "nature", 0, 3, "Climb an extinct volcano for the best view in the city."),
        ("Scotch Whisky Tasting", "food", 3200, 2, "Guided flight through Scotland's signature single malts."),
        ("Holyrood Palace", "culture", 1600, 2, "Official Scottish residence of the British monarch."),
        ("Edinburgh Ghost Tour", "nightlife", 1200, 2, "Spooky underground vaults and haunted tales."),
    ]),
    ("Manchester", "United Kingdom", 8000, 80, [
        ("Old Trafford Stadium Tour", "sightseeing", 2400, 2, "Behind the scenes at Manchester United's legendary ground."),
        ("Science & Industry Museum", "culture", 0, 2, "The story of the city that powered the Industrial Revolution."),
        ("Northern Quarter Bar Crawl", "nightlife", 3600, 3, "Indie bars and live music in the city's creative quarter."),
        ("Manchester Art Gallery", "culture", 0, 2, "Pre-Raphaelite art and contemporary exhibitions."),
        ("Curry Mile Food Tour", "food", 2000, 2, "South Asian cuisine along the famous Wilmslow Road."),
    ]),
    ("Bath", "United Kingdom", 8500, 76, [
        ("Roman Baths", "culture", 2400, 2, "Remarkably preserved thermal bathing complex from Roman Britain."),
        ("Thermae Bath Spa", "relax", 4000, 3, "Soak in naturally warm spring water with a rooftop pool."),
        ("Georgian City Walk", "sightseeing", 0, 2, "Honey-stone crescents and terraces of a UNESCO city."),
        ("Bath Abbey", "culture", 0, 1, "Gothic abbey with stunning fan vaulting."),
        ("Pulteney Bridge & Weir", "sightseeing", 0, 1, "Iconic bridge lined with shops over the River Avon."),
    ]),
    ("Liverpool", "United Kingdom", 7200, 74, [
        ("The Beatles Story", "culture", 1600, 2, "Immersive museum tracing the Fab Four from cavern to fame."),
        ("Royal Albert Dock", "sightseeing", 0, 2, "Revived waterfront of galleries, museums and restaurants."),
        ("Mersey Ferry Cruise", "nature", 1200, 1, "Classic river cruise with skyline views and commentary."),
        ("Anfield Stadium Tour", "sightseeing", 2200, 2, "Liverpool FC's historic home ground."),
        ("Liverpool Cathedral", "culture", 0, 1, "Britain's largest cathedral with panoramic tower views."),
    ]),
    ("Oxford", "United Kingdom", 8800, 86, [
        ("University Colleges Tour", "culture", 0, 2, "Walk through historic colleges and quadrangles."),
        ("Bodleian Library", "culture", 800, 1, "One of the oldest libraries in Europe."),
        ("Ashmolean Museum", "culture", 0, 2, "World-class art and archaeology museum."),
        ("Punting on the Cherwell", "nature", 2000, 1, "Traditional flat-bottomed boat ride along the river."),
        ("Oxford Covered Market", "food", 1600, 1, "Historic market with local food stalls."),
    ]),
    ("Cambridge", "United Kingdom", 8600, 84, [
        ("King's College Chapel", "culture", 1000, 1, "Gothic chapel with world-famous choir."),
        ("Punting on the Cam", "nature", 2200, 1, "Glide past the colleges from the river."),
        ("Fitzwilliam Museum", "culture", 0, 2, "Art and antiquities from Egypt to Impressionism."),
        ("Cambridge Market Square", "sightseeing", 0, 1, "Daily market in the historic center."),
        ("Mathematical Bridge", "sightseeing", 0, 1, "Iconic wooden footbridge at Queens' College."),
    ]),
    ("York", "United Kingdom", 7800, 82, [
        ("York Minster", "culture", 1200, 2, "Magnificent Gothic cathedral with medieval stained glass."),
        ("The Shambles", "sightseeing", 0, 1, "Medieval street that inspired Diagon Alley."),
        ("York City Walls Walk", "sightseeing", 0, 2, "Walk the complete circuit of medieval walls."),
        ("Jorvik Viking Centre", "culture", 1400, 2, "Immersive Viking-age experience."),
        ("York Dungeon", "nightlife", 1800, 2, "Theatrical horror show of York's dark history."),
    ]),
    ("Bristol", "United Kingdom", 7500, 78, [
        ("Clifton Suspension Bridge", "sightseeing", 0, 1, "Brunel's iconic bridge spanning the Avon Gorge."),
        ("SS Great Britain", "culture", 1600, 2, "Brunel's pioneering iron steamship, now a museum."),
        ("Bristol Harbour Walk", "nature", 0, 2, "Waterside promenade with street art and cafes."),
        ("Banksy Street Art Tour", "culture", 0, 2, "Hunt for works by Bristol's famous street artist."),
        ("St. Nicholas Market", "food", 1200, 1, "Covered market with global street food."),
    ]),
    ("Glasgow", "United Kingdom", 7000, 76, [
        ("Kelvingrove Art Gallery", "culture", 0, 2, "Victorian museum with art and natural history."),
        ("Glasgow Cathedral", "culture", 0, 1, "Medieval cathedral on the site of St. Mungo's tomb."),
        ("Riverside Museum", "culture", 0, 2, "Transport museum with vintage vehicles."),
        ("Ashton Lane", "nightlife", 2800, 3, "Cobbled lane with pubs and cinema."),
        ("Glasgow Necropolis", "sightseeing", 0, 1, "Victorian cemetery with city views."),
    ]),

    # ---------- India (15 cities) ----------
    ("New Delhi", "India", 3500, 90, [
        ("Red Fort", "culture", 650, 2, "Mughal sandstone fort and the backdrop to India's Independence Day."),
        ("India Gate & Rajpath", "sightseeing", 0, 1, "War memorial arch on the capital's ceremonial boulevard."),
        ("Old Delhi Street Food Walk", "food", 800, 3, "Chaat, kebabs and jalebi through the lanes of Chandni Chowk."),
        ("Qutub Minar", "culture", 650, 2, "Soaring 12th-century victory tower, a UNESCO site."),
        ("Humayun's Tomb", "culture", 650, 2, "Mughal architecture that inspired the Taj Mahal."),
        ("Lotus Temple", "culture", 0, 1, "Bahai house of worship shaped like a lotus flower."),
        ("Akshardham Temple", "culture", 0, 2, "Modern Hindu temple with elaborate carvings."),
    ]),
    ("Mumbai", "India", 4500, 88, [
        ("Gateway of India", "sightseeing", 0, 1, "Grand seafront arch and the city's most famous landmark."),
        ("Elephanta Caves", "culture", 600, 4, "Island rock-cut temples to Shiva, reached by ferry."),
        ("Marine Drive Sunset", "nature", 0, 1, "Stroll the curving 'Queen's Necklace' promenade at dusk."),
        ("Bollywood Studio Tour", "culture", 3200, 3, "Peek behind the scenes of the world's biggest film industry."),
        ("Chhatrapati Shivaji Terminus", "sightseeing", 0, 1, "Victorian Gothic railway station, UNESCO site."),
        ("Colaba Causeway Shopping", "sightseeing", 0, 2, "Bustling market street near the Gateway."),
        ("Dharavi Slum Tour", "culture", 1200, 3, "Community-led tour of Asia's largest informal settlement."),
    ]),
    ("Jaipur", "India", 3000, 85, [
        ("Amber Fort", "culture", 1000, 3, "Hilltop fort-palace of mirrored halls above a lake."),
        ("Hawa Mahal", "sightseeing", 400, 1, "The pink 'Palace of Winds' with its honeycomb of windows."),
        ("City Palace", "culture", 1200, 2, "Royal complex of courtyards, museums and living quarters."),
        ("Rajasthani Thali Feast", "food", 800, 1, "Endless platter of regional curries, breads and sweets."),
        ("Jantar Mantar Observatory", "culture", 400, 1, "18th-century astronomical instruments."),
        ("Nahargarh Fort Sunset", "sightseeing", 600, 2, "Fort with panoramic views of the Pink City."),
    ]),
    ("Goa", "India", 4000, 87, [
        ("Baga Beach", "nature", 0, 3, "Golden sands, water sports and the buzz of the north coast."),
        ("Old Goa Churches", "culture", 0, 2, "Baroque cathedrals of the former Portuguese capital."),
        ("Sunset Dolphin Cruise", "adventure", 2400, 2, "Boat out to spot dolphins as the sun drops over the Arabian Sea."),
        ("Beach Shack Seafood", "food", 1600, 2, "Fresh-grilled catch and feni at a toes-in-the-sand shack."),
        ("Spice Plantation Tour", "nature", 1200, 3, "Walk through aromatic spice gardens with traditional lunch."),
        ("Dudhsagar Waterfalls", "nature", 2000, 4, "Four-tier waterfall trek in the jungle."),
    ]),
    ("Varanasi", "India", 2500, 80, [
        ("Ganga Aarti Ceremony", "culture", 0, 2, "Fire-and-chant riverside ritual at Dashashwamedh Ghat."),
        ("Sunrise Boat Ride on the Ganges", "nature", 1000, 2, "Drift past the waking ghats in the first light of day."),
        ("Sarnath Buddhist Site", "culture", 400, 2, "Where the Buddha gave his first sermon, marked by a great stupa."),
        ("Varanasi Food Walk", "food", 900, 2, "Street food tour through the ancient lanes."),
    ]),
    ("Agra", "India", 3200, 92, [
        ("Taj Mahal Sunrise", "culture", 1100, 3, "Marvel at the world's greatest monument to love at first light."),
        ("Agra Fort", "culture", 700, 2, "Massive red sandstone fort and Mughal palace."),
        ("Fatehpur Sikri", "culture", 650, 3, "Ghost city of red sandstone, Akbar's abandoned capital."),
        ("Mughlai Cuisine Dinner", "food", 1400, 2, "Rich North Indian curries and kebabs."),
    ]),
    ("Udaipur", "India", 3800, 84, [
        ("City Palace & Lake Pichola", "culture", 800, 2, "Maharaja's palace complex on the lake shore."),
        ("Boat Ride to Jag Mandir", "nature", 600, 1, "Cruise to the island palace on Lake Pichola."),
        ("Bagore Ki Haveli Folk Show", "culture", 500, 2, "Traditional Rajasthani dance and music performance."),
        ("Sunset at Monsoon Palace", "sightseeing", 400, 2, "Hilltop palace with lake and city views."),
    ]),
    ("Bangalore", "India", 3600, 82, [
        ("Lalbagh Botanical Garden", "nature", 100, 2, "Historic botanical garden with glasshouse."),
        ("Bangalore Palace", "culture", 300, 1, "Tudor-style palace with vintage photos."),
        ("Craft Beer Brewery Tour", "nightlife", 1600, 3, "India's craft beer capital with multiple microbreweries."),
        ("Cubbon Park", "nature", 0, 1, "Green lung in the heart of the city."),
        ("South Indian Thali", "food", 600, 1, "Vegetarian feast on a banana leaf."),
    ]),
    ("Kochi", "India", 3400, 78, [
        ("Chinese Fishing Nets", "sightseeing", 0, 1, "Iconic cantilevered fishing nets at the harbor."),
        ("Fort Kochi Heritage Walk", "culture", 0, 2, "Colonial Dutch and Portuguese architecture."),
        ("Kathakali Dance Performance", "culture", 700, 2, "Traditional Kerala dance-drama with elaborate costumes."),
        ("Backwater Houseboat Cruise", "nature", 4500, 6, "Day cruise through palm-fringed canals."),
        ("Kerala Fish Curry Meal", "food", 900, 1, "Spicy coconut-based seafood curry."),
    ]),
    ("Rishikesh", "India", 2200, 76, [
        ("River Rafting on Ganges", "adventure", 2000, 3, "White-water rafting through scenic rapids."),
        ("Beatles Ashram", "culture", 150, 1, "Abandoned ashram with Beatles graffiti."),
        ("Yoga Class by the River", "relax", 800, 2, "Traditional yoga session with mountain views."),
        ("Ganga Aarti at Triveni Ghat", "culture", 0, 1, "Evening fire ritual by the holy river."),
        ("Lakshman Jhula Bridge Walk", "sightseeing", 0, 1, "Iconic suspension bridge over the Ganges."),
    ]),
    ("Amritsar", "India", 2800, 83, [
        ("Golden Temple", "culture", 0, 2, "Sikhism's holiest shrine, gleaming gold over the sacred pool."),
        ("Jallianwala Bagh", "culture", 0, 1, "Memorial garden of the 1919 massacre."),
        ("Wagah Border Ceremony", "culture", 0, 2, "Daily flag-lowering ceremony with India-Pakistan rivalry."),
        ("Amritsari Kulcha Meal", "food", 500, 1, "Stuffed bread with chickpeas, Amritsar's signature dish."),
    ]),
    ("Kolkata", "India", 3000, 81, [
        ("Victoria Memorial", "culture", 250, 2, "Grand white marble monument to the British Raj."),
        ("Howrah Bridge", "sightseeing", 0, 1, "Iconic cantilever bridge over the Hooghly River."),
        ("Kolkata Street Food Tour", "food", 700, 3, "Puchka, kathi rolls and sweets in the food capital."),
        ("Dakshineswar Kali Temple", "culture", 0, 1, "Riverside temple dedicated to goddess Kali."),
        ("Park Street Nightlife", "nightlife", 2000, 3, "Colonial-era street with bars and live music."),
    ]),
    ("Hampi", "India", 2000, 79, [
        ("Virupaksha Temple", "culture", 50, 1, "Ancient temple still in active worship."),
        ("Vittala Temple Complex", "culture", 600, 2, "Ruins with the famous stone chariot."),
        ("Hampi Bouldering", "adventure", 2500, 4, "Rock climbing on giant boulders in surreal landscape."),
        ("Tungabhadra River Coracle Ride", "nature", 400, 1, "Traditional round boat ride."),
    ]),
    ("Darjeeling", "India", 3500, 77, [
        ("Tiger Hill Sunrise", "nature", 0, 2, "Watch sunrise over Kanchenjunga from 2590m."),
        ("Toy Train Ride", "sightseeing", 1200, 2, "UNESCO heritage narrow-gauge railway through hills."),
        ("Tea Estate Tour", "culture", 800, 2, "Visit working tea gardens and tasting."),
        ("Darjeeling Himalayan Zoo", "nature", 100, 1, "Red pandas and Himalayan wildlife."),
    ]),
    ("Pushkar", "India", 2400, 75, [
        ("Pushkar Lake & Ghats", "culture", 0, 1, "Sacred lake with bathing ghats and temples."),
        ("Brahma Temple", "culture", 0, 1, "One of few temples dedicated to Lord Brahma."),
        ("Camel Safari in Thar Desert", "adventure", 2800, 4, "Sunset camel ride with desert camp stay."),
        ("Pushkar Market Shopping", "sightseeing", 0, 2, "Colorful bazaar with handicrafts and jewelry."),
    ]),
]


def seed_catalog(session, reset: bool = False) -> None:
    """Seed cities + activities. reset=True wipes catalog (and dependent
    stops/links) first — used by seed.py. Startup calls with reset=False and
    seeds only when the City table is empty."""
    from models import City, Activity, Stop, StopActivity

    if reset:
        for model in (StopActivity, Stop, Activity, City):
            for row in session.exec(select(model)).all():
                session.delete(row)
        session.commit()

    if session.exec(select(City)).first():
        return  # already seeded

    for name, country, ci, popularity, acts in CITIES:
        city = City(name=name, country=country, cost_index=ci, popularity=popularity)
        session.add(city)
        session.commit()
        session.refresh(city)
        for aname, atype, cost, hrs, desc in acts:
            session.add(Activity(
                city_id=city.id, name=aname, type=atype,
                cost=cost, duration_hours=hrs, description=desc,
            ))
    session.commit()


def seed_demo_users_and_trips(session) -> None:
    """Seed demo users with pre-built public itineraries for testing.
    Only runs if alex@example.com doesn't exist yet."""
    from models import User, Trip, Stop, StopActivity, City, Activity
    from passlib.context import CryptContext
    import secrets
    
    pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    
    # Check if demo user exists
    existing = session.exec(select(User).where(User.email == "alex@example.com")).first()
    if existing:
        print("Demo users already exist, skipping...")
        return
    
    # Create demo users
    alex = User(
        email="alex@example.com",
        pw_hash=pwd_context.hash("password123"),
        first_name="Alex",
        last_name="Kumar",
        phone="+91 98765 43210",
        city="Mumbai",
        country="India",
        bio="Travel enthusiast exploring Asia. Love temples, street food, and adventure sports!"
    )
    session.add(alex)
    
    priya = User(
        email="priya@example.com",
        pw_hash=pwd_context.hash("password123"),
        first_name="Priya",
        last_name="Sharma",
        phone="+91 87654 32109",
        city="New Delhi",
        country="India",
        bio="Food blogger and culture lover. Always hunting for the best local experiences."
    )
    session.add(priya)
    
    james = User(
        email="james@example.com",
        pw_hash=pwd_context.hash("password123"),
        first_name="James",
        last_name="Wilson",
        phone="+44 7700 900123",
        city="London",
        country="United Kingdom",
        bio="History buff and architecture enthusiast. Planning trips across Asia."
    )
    session.add(james)
    
    session.commit()
    session.refresh(alex)
    session.refresh(priya)
    session.refresh(james)
    
    # Get cities for trips
    tokyo = session.exec(select(City).where(City.name == "Tokyo")).first()
    kyoto = session.exec(select(City).where(City.name == "Kyoto")).first()
    osaka = session.exec(select(City).where(City.name == "Osaka")).first()
    delhi = session.exec(select(City).where(City.name == "New Delhi")).first()
    agra = session.exec(select(City).where(City.name == "Agra")).first()
    jaipur = session.exec(select(City).where(City.name == "Jaipur")).first()
    mumbai = session.exec(select(City).where(City.name == "Mumbai")).first()
    goa = session.exec(select(City).where(City.name == "Goa")).first()
    varanasi = session.exec(select(City).where(City.name == "Varanasi")).first()
    london = session.exec(select(City).where(City.name == "London")).first()
    edinburgh = session.exec(select(City).where(City.name == "Edinburgh")).first()
    oxford = session.exec(select(City).where(City.name == "Oxford")).first()
    
    today = date.today()
    
    # Trip 1: Alex's Japan Golden Route (PUBLIC)
    japan_trip = Trip(
        user_id=alex.id,
        name="Japan Golden Route Adventure",
        country="Japan",
        start_date=today + timedelta(days=30),
        end_date=today + timedelta(days=44),
        description="Two weeks exploring Japan's cultural heartland - from Tokyo's neon to Kyoto's temples, with a taste of Osaka's street food scene.",
        is_public=True,
        share_token=secrets.token_urlsafe(8)
    )
    session.add(japan_trip)
    session.commit()
    session.refresh(japan_trip)
    
    # Tokyo stop (5 days)
    tokyo_stop = Stop(
        trip_id=japan_trip.id,
        city_id=tokyo.id,
        start_date=today + timedelta(days=30),
        end_date=today + timedelta(days=35),
        order=1
    )
    session.add(tokyo_stop)
    session.commit()
    session.refresh(tokyo_stop)
    
    # Add activities to Tokyo
    tokyo_activities = session.exec(
        select(Activity).where(Activity.city_id == tokyo.id)
    ).all()[:5]
    for act in tokyo_activities:
        session.add(StopActivity(stop_id=tokyo_stop.id, activity_id=act.id))
    
    # Kyoto stop (6 days)
    kyoto_stop = Stop(
        trip_id=japan_trip.id,
        city_id=kyoto.id,
        start_date=today + timedelta(days=35),
        end_date=today + timedelta(days=41),
        order=2
    )
    session.add(kyoto_stop)
    session.commit()
    session.refresh(kyoto_stop)
    
    kyoto_activities = session.exec(
        select(Activity).where(Activity.city_id == kyoto.id)
    ).all()[:6]
    for act in kyoto_activities:
        session.add(StopActivity(stop_id=kyoto_stop.id, activity_id=act.id))
    
    # Osaka stop (3 days)
    osaka_stop = Stop(
        trip_id=japan_trip.id,
        city_id=osaka.id,
        start_date=today + timedelta(days=41),
        end_date=today + timedelta(days=44),
        order=3
    )
    session.add(osaka_stop)
    session.commit()
    session.refresh(osaka_stop)
    
    osaka_activities = session.exec(
        select(Activity).where(Activity.city_id == osaka.id)
    ).all()[:4]
    for act in osaka_activities:
        session.add(StopActivity(stop_id=osaka_stop.id, activity_id=act.id))
    
    # Trip 2: Priya's Golden Triangle (PUBLIC)
    golden_triangle = Trip(
        user_id=priya.id,
        name="Golden Triangle Heritage Tour",
        country="India",
        start_date=today + timedelta(days=60),
        end_date=today + timedelta(days=68),
        description="Classic India circuit covering Delhi's monuments, Agra's Taj Mahal, and Jaipur's pink palaces - perfect first-time India itinerary.",
        is_public=True,
        share_token=secrets.token_urlsafe(8)
    )
    session.add(golden_triangle)
    session.commit()
    session.refresh(golden_triangle)
    
    # Delhi (3 days)
    delhi_stop = Stop(
        trip_id=golden_triangle.id,
        city_id=delhi.id,
        start_date=today + timedelta(days=60),
        end_date=today + timedelta(days=63),
        order=1
    )
    session.add(delhi_stop)
    session.commit()
    session.refresh(delhi_stop)
    
    delhi_activities = session.exec(select(Activity).where(Activity.city_id == delhi.id)).all()[:5]
    for act in delhi_activities:
        session.add(StopActivity(stop_id=delhi_stop.id, activity_id=act.id))
    
    # Agra (2 days)
    agra_stop = Stop(
        trip_id=golden_triangle.id,
        city_id=agra.id,
        start_date=today + timedelta(days=63),
        end_date=today + timedelta(days=65),
        order=2
    )
    session.add(agra_stop)
    session.commit()
    session.refresh(agra_stop)
    
    agra_activities = session.exec(select(Activity).where(Activity.city_id == agra.id)).all()
    for act in agra_activities:
        session.add(StopActivity(stop_id=agra_stop.id, activity_id=act.id))
    
    # Jaipur (3 days)
    jaipur_stop = Stop(
        trip_id=golden_triangle.id,
        city_id=jaipur.id,
        start_date=today + timedelta(days=65),
        end_date=today + timedelta(days=68),
        order=3
    )
    session.add(jaipur_stop)
    session.commit()
    session.refresh(jaipur_stop)
    
    jaipur_activities = session.exec(select(Activity).where(Activity.city_id == jaipur.id)).all()[:5]
    for act in jaipur_activities:
        session.add(StopActivity(stop_id=jaipur_stop.id, activity_id=act.id))
    
    # Trip 3: James' UK Explorer (PUBLIC)
    uk_trip = Trip(
        user_id=james.id,
        name="British Isles Explorer",
        country="United Kingdom",
        start_date=today + timedelta(days=45),
        end_date=today + timedelta(days=55),
        description="Ten days discovering Britain's finest cities - from London's museums to Edinburgh's castle, with a stop at Oxford's dreaming spires.",
        is_public=True,
        share_token=secrets.token_urlsafe(8)
    )
    session.add(uk_trip)
    session.commit()
    session.refresh(uk_trip)
    
    # London (4 days)
    london_stop = Stop(
        trip_id=uk_trip.id,
        city_id=london.id,
        start_date=today + timedelta(days=45),
        end_date=today + timedelta(days=49),
        order=1
    )
    session.add(london_stop)
    session.commit()
    session.refresh(london_stop)
    
    london_activities = session.exec(select(Activity).where(Activity.city_id == london.id)).all()[:6]
    for act in london_activities:
        session.add(StopActivity(stop_id=london_stop.id, activity_id=act.id))
    
    # Oxford (2 days)
    oxford_stop = Stop(
        trip_id=uk_trip.id,
        city_id=oxford.id,
        start_date=today + timedelta(days=49),
        end_date=today + timedelta(days=51),
        order=2
    )
    session.add(oxford_stop)
    session.commit()
    session.refresh(oxford_stop)
    
    oxford_activities = session.exec(select(Activity).where(Activity.city_id == oxford.id)).all()
    for act in oxford_activities:
        session.add(StopActivity(stop_id=oxford_stop.id, activity_id=act.id))
    
    # Edinburgh (4 days)
    edinburgh_stop = Stop(
        trip_id=uk_trip.id,
        city_id=edinburgh.id,
        start_date=today + timedelta(days=51),
        end_date=today + timedelta(days=55),
        order=3
    )
    session.add(edinburgh_stop)
    session.commit()
    session.refresh(edinburgh_stop)
    
    edinburgh_activities = session.exec(select(Activity).where(Activity.city_id == edinburgh.id)).all()
    for act in edinburgh_activities:
        session.add(StopActivity(stop_id=edinburgh_stop.id, activity_id=act.id))
    
    # Trip 4: Alex's Beach & Spiritual India (PUBLIC)
    spiritual_india = Trip(
        user_id=alex.id,
        name="Spiritual India & Beach Escape",
        country="India",
        start_date=today + timedelta(days=90),
        end_date=today + timedelta(days=102),
        description="From the sacred ghats of Varanasi to Goa's golden beaches, experience India's spiritual heart and coastal chill.",
        is_public=True,
        share_token=secrets.token_urlsafe(8)
    )
    session.add(spiritual_india)
    session.commit()
    session.refresh(spiritual_india)
    
    # Varanasi (3 days)
    varanasi_stop = Stop(
        trip_id=spiritual_india.id,
        city_id=varanasi.id,
        start_date=today + timedelta(days=90),
        end_date=today + timedelta(days=93),
        order=1
    )
    session.add(varanasi_stop)
    session.commit()
    session.refresh(varanasi_stop)
    
    varanasi_activities = session.exec(select(Activity).where(Activity.city_id == varanasi.id)).all()
    for act in varanasi_activities:
        session.add(StopActivity(stop_id=varanasi_stop.id, activity_id=act.id))
    
    # Mumbai (4 days)
    mumbai_stop = Stop(
        trip_id=spiritual_india.id,
        city_id=mumbai.id,
        start_date=today + timedelta(days=93),
        end_date=today + timedelta(days=97),
        order=2
    )
    session.add(mumbai_stop)
    session.commit()
    session.refresh(mumbai_stop)
    
    mumbai_activities = session.exec(select(Activity).where(Activity.city_id == mumbai.id)).all()[:5]
    for act in mumbai_activities:
        session.add(StopActivity(stop_id=mumbai_stop.id, activity_id=act.id))
    
    # Goa (5 days)
    goa_stop = Stop(
        trip_id=spiritual_india.id,
        city_id=goa.id,
        start_date=today + timedelta(days=97),
        end_date=today + timedelta(days=102),
        order=3
    )
    session.add(goa_stop)
    session.commit()
    session.refresh(goa_stop)
    
    goa_activities = session.exec(select(Activity).where(Activity.city_id == goa.id)).all()
    for act in goa_activities:
        session.add(StopActivity(stop_id=goa_stop.id, activity_id=act.id))
    
    session.commit()
    print(f"✓ Created demo users and 4 public itineraries")
    print(f"  Alex's trips: {japan_trip.id}, {spiritual_india.id}")
    print(f"  Priya's trip: {golden_triangle.id}")
    print(f"  James' trip: {uk_trip.id}")
    print(f"\nDemo login credentials:")
    print(f"  alex@example.com / password123")
    print(f"  priya@example.com / password123")
    print(f"  james@example.com / password123")
