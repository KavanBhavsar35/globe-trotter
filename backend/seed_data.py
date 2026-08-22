# Seed catalog: cities + their activities, grouped by country.
# (city_name, country, cost_index_usd_per_night, [ (activity, type, cost, hours) ... ])
# Scope: Japan, UK, India only — users pick a country, then its cities.

from sqlmodel import select

CITIES = [
    # ---------- Japan ----------
    ("Tokyo", "Japan", 180, [
        ("Senso-ji Temple, Asakusa", "culture", 0, 2),
        ("Shibuya & Shinjuku Walk", "sightseeing", 0, 3),
        ("Sushi Omakase Dinner", "food", 120, 2),
        ("teamLab Planets Digital Art", "culture", 35, 3),
    ]),
    ("Kyoto", "Japan", 150, [
        ("Fushimi Inari Shrine", "culture", 0, 3),
        ("Arashiyama Bamboo Grove", "nature", 0, 2),
        ("Traditional Tea Ceremony", "culture", 45, 1),
        ("Kaiseki Multi-course Dinner", "food", 90, 2),
    ]),
    ("Osaka", "Japan", 140, [
        ("Osaka Castle", "sightseeing", 15, 2),
        ("Dotonbori Street Food Crawl", "food", 40, 2),
        ("Universal Studios Japan", "adventure", 80, 8),
        ("Umeda Sky Building", "sightseeing", 20, 1),
    ]),
    ("Hiroshima", "Japan", 120, [
        ("Peace Memorial Park & Museum", "culture", 0, 2),
        ("Miyajima Island & Floating Torii", "nature", 25, 5),
        ("Okonomiyaki Tasting", "food", 20, 1),
    ]),
    ("Sapporo", "Japan", 130, [
        ("Sapporo Beer Museum", "food", 10, 2),
        ("Odori Park Stroll", "nature", 0, 1),
        ("Susukino Nightlife", "nightlife", 50, 3),
    ]),

    # ---------- United Kingdom ----------
    ("London", "United Kingdom", 200, [
        ("Tower of London", "culture", 35, 3),
        ("British Museum", "culture", 0, 3),
        ("West End Theatre Show", "nightlife", 90, 3),
        ("Borough Market Food Tour", "food", 45, 2),
    ]),
    ("Edinburgh", "United Kingdom", 150, [
        ("Edinburgh Castle", "culture", 25, 2),
        ("Royal Mile Walk", "sightseeing", 0, 2),
        ("Arthur's Seat Hike", "nature", 0, 3),
        ("Scotch Whisky Tasting", "food", 40, 2),
    ]),
    ("Manchester", "United Kingdom", 130, [
        ("Old Trafford Stadium Tour", "sightseeing", 30, 2),
        ("Science & Industry Museum", "culture", 0, 2),
        ("Northern Quarter Bar Crawl", "nightlife", 45, 3),
    ]),
    ("Bath", "United Kingdom", 140, [
        ("Roman Baths", "culture", 30, 2),
        ("Thermae Bath Spa", "nature", 50, 3),
        ("Georgian City Walk", "sightseeing", 0, 2),
    ]),
    ("Liverpool", "United Kingdom", 120, [
        ("The Beatles Story", "culture", 20, 2),
        ("Royal Albert Dock", "sightseeing", 0, 2),
        ("Mersey Ferry Cruise", "nature", 15, 1),
    ]),

    # ---------- India ----------
    ("New Delhi", "India", 70, [
        ("Red Fort", "culture", 8, 2),
        ("India Gate & Rajpath", "sightseeing", 0, 1),
        ("Old Delhi Street Food Walk", "food", 15, 3),
        ("Qutub Minar", "culture", 8, 2),
    ]),
    ("Mumbai", "India", 90, [
        ("Gateway of India", "sightseeing", 0, 1),
        ("Elephanta Caves", "culture", 20, 4),
        ("Marine Drive Sunset", "nature", 0, 1),
        ("Bollywood Studio Tour", "culture", 40, 3),
    ]),
    ("Jaipur", "India", 60, [
        ("Amber Fort", "culture", 12, 3),
        ("Hawa Mahal", "sightseeing", 5, 1),
        ("City Palace", "culture", 15, 2),
        ("Rajasthani Thali Feast", "food", 12, 1),
    ]),
    ("Goa", "India", 80, [
        ("Baga Beach", "nature", 0, 3),
        ("Old Goa Churches", "culture", 0, 2),
        ("Sunset Dolphin Cruise", "adventure", 30, 2),
        ("Beach Shack Seafood", "food", 25, 2),
    ]),
    ("Varanasi", "India", 50, [
        ("Ganga Aarti Ceremony", "culture", 0, 2),
        ("Sunrise Boat Ride on the Ganges", "nature", 15, 2),
        ("Sarnath Buddhist Site", "culture", 5, 2),
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

    for name, country, ci, acts in CITIES:
        city = City(name=name, country=country, cost_index=ci)
        session.add(city)
        session.commit()
        session.refresh(city)
        for aname, atype, cost, hrs in acts:
            session.add(Activity(city_id=city.id, name=aname, type=atype, cost=cost, duration_hours=hrs))
    session.commit()
