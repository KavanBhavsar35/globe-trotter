"""Setup script for GlobeTrotter database with INR pricing."""

import sqlite3
import sys
import os
from sqlmodel import SQLModel, create_engine, Session

# Database configuration
DATABASE_URL = "sqlite:///./globetrotter.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_database():
    """Create all tables from SQLModel models."""
    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully")


def verify_database():
    """Verify database is accessible and show stats."""
    try:
        conn = sqlite3.connect("./globetrotter.db", timeout=30)
        cur = conn.cursor()

        tables = cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        ).fetchall()
        print(f"Database tables: {[t[0] for t in tables]}")

        # Count cities
        cur.execute("SELECT COUNT(*) FROM city")
        city_count = cur.fetchone()[0]
        print(f"Cities: {city_count}")

        # Count activities
        cur.execute("SELECT COUNT(*) FROM activity")
        activity_count = cur.fetchone()[0]
        print(f"Activities: {activity_count}")

        # Count users
        cur.execute("SELECT COUNT(*) FROM user")
        user_count = cur.fetchone()[0]
        print(f"Users: {user_count}")

        conn.close()
        return True
    except Exception as e:
        print(f"Database verification failed: {e}")
        return False


def main():
    print("GlobeTrotter Database Setup with INR Pricing")
    print("=" * 50)

    # Step 1: Remove old database if exists
    if os.path.exists("./globetrotter.db"):
        print("\nRemoving existing database...")
        os.remove("./globetrotter.db")
        print("Old database removed")

    # Step 2: Create fresh database
    print("\nStep 1: Creating database tables...")
    create_database()

    # Step 3: Verify tables created
    print("\nStep 2: Verifying database structure...")
    if not verify_database():
        print("Failed to verify database")
        sys.exit(1)

    print("\nDatabase ready! Now run: python seed.py to populate data")
    print("=" * 50)


if __name__ == "__main__":
    main()