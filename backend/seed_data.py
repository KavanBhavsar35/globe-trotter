# Seed catalog: cities + their activities, grouped by country.
# (city_name, country, cost_index_usd_per_night, popularity_0_100, [ (activity, type, cost, hours, description) ... ])
# Scope: Japan, UK, India only — users pick a country, then its cities.
# img_url is left blank on both city + activity → client falls back to loremflickr.

from sqlmodel import select

CITIES = [
    # ---------- Japan ----------
    ("Tokyo", "Japan", 180, 98, [
        ("Senso-ji Temple, Asakusa", "culture", 0, 2, "Tokyo's oldest temple, framed by the Kaminarimon gate and a lively market street."),
        ("Shibuya & Shinjuku Walk", "sightseeing", 0, 3, "Neon crossings, backstreet izakayas and the pulse of the world's busiest districts."),
        ("Sushi Omakase Dinner", "food", 120, 2, "Chef's-choice sushi served piece by piece at the counter."),
        ("teamLab Planets Digital Art", "culture", 35, 3, "Wade through immersive, water-and-light digital art rooms."),
    ]),
    ("Kyoto", "Japan", 150, 95, [
        ("Fushimi Inari Shrine", "culture", 0, 3, "Hike the tunnel of thousands of vermilion torii gates up the mountain."),
        ("Arashiyama Bamboo Grove", "nature", 0, 2, "Walk the towering bamboo path and riverside temples on the city's west edge."),
        ("Traditional Tea Ceremony", "culture", 45, 1, "Learn the ritual of matcha in a tatami tea room."),
        ("Kaiseki Multi-course Dinner", "food", 90, 2, "Seasonal, artfully plated Japanese haute cuisine."),
    ]),
    ("Osaka", "Japan", 140, 90, [
        ("Osaka Castle", "sightseeing", 15, 2, "Iconic hilltop keep set in a moat and cherry-tree park."),
        ("Dotonbori Street Food Crawl", "food", 40, 2, "Takoyaki, okonomiyaki and neon signs along the canal."),
        ("Universal Studios Japan", "adventure", 80, 8, "Big-ticket theme park with Nintendo World and thrill rides."),
        ("Umeda Sky Building", "sightseeing", 20, 1, "Floating rooftop observatory with 360° city views."),
    ]),
    ("Hiroshima", "Japan", 120, 78, [
        ("Peace Memorial Park & Museum", "culture", 0, 2, "Moving memorial and museum on the site of the 1945 bombing."),
        ("Miyajima Island & Floating Torii", "nature", 25, 5, "Ferry to the island shrine whose great gate stands in the sea."),
        ("Okonomiyaki Tasting", "food", 20, 1, "Hiroshima-style layered savoury pancake cooked on the griddle."),
    ]),
    ("Sapporo", "Japan", 130, 72, [
        ("Sapporo Beer Museum", "food", 10, 2, "Japan's oldest beer brand, with tastings in a red-brick hall."),
        ("Odori Park Stroll", "nature", 0, 1, "Green ribbon through downtown, host of the famous snow festival."),
        ("Susukino Nightlife", "nightlife", 50, 3, "Hokkaido's biggest entertainment quarter after dark."),
    ]),

    # ---------- United Kingdom ----------
    ("London", "United Kingdom", 200, 97, [
        ("Tower of London", "culture", 35, 3, "Historic fortress guarding the Crown Jewels, led by the Beefeaters."),
        ("British Museum", "culture", 0, 3, "World treasures from the Rosetta Stone to the Parthenon marbles."),
        ("West End Theatre Show", "nightlife", 90, 3, "A night at one of the world's great theatre districts."),
        ("Borough Market Food Tour", "food", 45, 2, "Graze artisan stalls at London's most storied food market."),
    ]),
    ("Edinburgh", "United Kingdom", 150, 88, [
        ("Edinburgh Castle", "culture", 25, 2, "Clifftop fortress over the city, home of the Stone of Destiny."),
        ("Royal Mile Walk", "sightseeing", 0, 2, "Cobbled spine of the Old Town from castle to palace."),
        ("Arthur's Seat Hike", "nature", 0, 3, "Climb an extinct volcano for the best view in the city."),
        ("Scotch Whisky Tasting", "food", 40, 2, "Guided flight through Scotland's signature single malts."),
    ]),
    ("Manchester", "United Kingdom", 130, 80, [
        ("Old Trafford Stadium Tour", "sightseeing", 30, 2, "Behind the scenes at Manchester United's legendary ground."),
        ("Science & Industry Museum", "culture", 0, 2, "The story of the city that powered the Industrial Revolution."),
        ("Northern Quarter Bar Crawl", "nightlife", 45, 3, "Indie bars and live music in the city's creative quarter."),
    ]),
    ("Bath", "United Kingdom", 140, 76, [
        ("Roman Baths", "culture", 30, 2, "Remarkably preserved thermal bathing complex from Roman Britain."),
        ("Thermae Bath Spa", "relax", 50, 3, "Soak in naturally warm spring water with a rooftop pool."),
        ("Georgian City Walk", "sightseeing", 0, 2, "Honey-stone crescents and terraces of a UNESCO city."),
    ]),
    ("Liverpool", "United Kingdom", 120, 74, [
        ("The Beatles Story", "culture", 20, 2, "Immersive museum tracing the Fab Four from cavern to fame."),
        ("Royal Albert Dock", "sightseeing", 0, 2, "Revived waterfront of galleries, museums and restaurants."),
        ("Mersey Ferry Cruise", "nature", 15, 1, "Classic river cruise with skyline views and commentary."),
    ]),

    # ---------- India ----------
    ("New Delhi", "India", 70, 90, [
        ("Red Fort", "culture", 8, 2, "Mughal sandstone fort and the backdrop to India's Independence Day."),
        ("India Gate & Rajpath", "sightseeing", 0, 1, "War memorial arch on the capital's ceremonial boulevard."),
        ("Old Delhi Street Food Walk", "food", 15, 3, "Chaat, kebabs and jalebi through the lanes of Chandni Chowk."),
        ("Qutub Minar", "culture", 8, 2, "Soaring 12th-century victory tower, a UNESCO site."),
    ]),
    ("Mumbai", "India", 90, 88, [
        ("Gateway of India", "sightseeing", 0, 1, "Grand seafront arch and the city's most famous landmark."),
        ("Elephanta Caves", "culture", 20, 4, "Island rock-cut temples to Shiva, reached by ferry."),
        ("Marine Drive Sunset", "nature", 0, 1, "Stroll the curving 'Queen's Necklace' promenade at dusk."),
        ("Bollywood Studio Tour", "culture", 40, 3, "Peek behind the scenes of the world's biggest film industry."),
    ]),
    ("Jaipur", "India", 60, 85, [
        ("Amber Fort", "culture", 12, 3, "Hilltop fort-palace of mirrored halls above a lake."),
        ("Hawa Mahal", "sightseeing", 5, 1, "The pink 'Palace of Winds' with its honeycomb of windows."),
        ("City Palace", "culture", 15, 2, "Royal complex of courtyards, museums and living quarters."),
        ("Rajasthani Thali Feast", "food", 12, 1, "Endless platter of regional curries, breads and sweets."),
    ]),
    ("Goa", "India", 80, 87, [
        ("Baga Beach", "nature", 0, 3, "Golden sands, water sports and the buzz of the north coast."),
        ("Old Goa Churches", "culture", 0, 2, "Baroque cathedrals of the former Portuguese capital."),
        ("Sunset Dolphin Cruise", "adventure", 30, 2, "Boat out to spot dolphins as the sun drops over the Arabian Sea."),
        ("Beach Shack Seafood", "food", 25, 2, "Fresh-grilled catch and feni at a toes-in-the-sand shack."),
    ]),
    ("Varanasi", "India", 50, 80, [
        ("Ganga Aarti Ceremony", "culture", 0, 2, "Fire-and-chant riverside ritual at Dashashwamedh Ghat."),
        ("Sunrise Boat Ride on the Ganges", "nature", 15, 2, "Drift past the waking ghats in the first light of day."),
        ("Sarnath Buddhist Site", "culture", 5, 2, "Where the Buddha gave his first sermon, marked by a great stupa."),
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
