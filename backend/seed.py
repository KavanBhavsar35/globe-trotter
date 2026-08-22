"""Reset + seed the catalog (Japan / UK / India cities + activities) and demo users.

Run from backend/ with the venv active:

    python seed.py

Wipes cities, activities, and any stops/links that reference them
(trips themselves are kept, but their stops are cleared), then reseeds.
Also creates demo users with public itineraries if they don't exist.
"""

from sqlmodel import Session

from db import init_db, engine
from seed_data import seed_catalog, seed_demo_users_and_trips

if __name__ == "__main__":
    init_db()
    with Session(engine) as s:
        print("Seeding catalog (35 cities across Japan, UK, India with INR pricing)...")
        seed_catalog(s, reset=True)
        print("✓ Catalog reseeded: 10 Japan, 10 UK, 15 India cities\n")
        
        print("Seeding demo users and public itineraries...")
        seed_demo_users_and_trips(s)
        print("\n✓ Seeding complete!")
