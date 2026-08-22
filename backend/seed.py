"""Reset + seed the catalog (Japan / UK / India cities + activities).

Run from backend/ with the venv active:

    python seed.py

Wipes cities, activities, and any stops/links that reference them
(trips themselves are kept, but their stops are cleared), then reseeds.
"""

from sqlmodel import Session

from db import init_db, engine
from seed_data import seed_catalog

if __name__ == "__main__":
    init_db()
    with Session(engine) as s:
        seed_catalog(s, reset=True)
    print("Catalog reseeded: Japan, United Kingdom, India.")
