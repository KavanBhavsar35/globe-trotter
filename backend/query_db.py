"""Query script to check database status and user data."""
import sqlite3
import sys

def query_db():
    try:
        conn = sqlite3.connect('globetrotter.db', timeout=10)
        cur = conn.cursor()
        
        # Count cities
        cur.execute('SELECT COUNT(*) FROM city')
        city_count = cur.fetchone()[0]
        print(f"\n📍 Cities in database: {city_count}")
        
        # Sample cities
        cur.execute('SELECT name, country, cost_index, popularity FROM city ORDER BY popularity DESC LIMIT 5')
        print("\nTop 5 cities by popularity:")
        for name, country, cost, pop in cur.fetchall():
            print(f"  - {name}, {country}: ₹{cost}/day (popularity: {pop})")
        
        # Count activities
        cur.execute('SELECT COUNT(*) FROM activity')
        activity_count = cur.fetchone()[0]
        print(f"\n🎯 Activities in database: {activity_count}")
        
        # Count users
        cur.execute('SELECT COUNT(*) FROM user')
        user_count = cur.fetchone()[0]
        print(f"\n👤 Users in database: {user_count}")
        
        # Get user details
        cur.execute('SELECT email, first_name, last_name, city, country FROM user')
        users = cur.fetchall()
        if users:
            print("\nUser accounts:")
            for email, fname, lname, city, country in users:
                name = f"{fname} {lname}".strip() or "N/A"
                location = f"{city}, {country}".strip(", ") or "N/A"
                print(f"  - {email}: {name} ({location})")
        
        # Get alex@example.com password hash
        cur.execute('SELECT email, pw_hash FROM user WHERE email = ?', ('alex@example.com',))
        alex = cur.fetchone()
        if alex:
            print(f"\n🔐 alex@example.com password hash:")
            print(f"  {alex[1][:60]}...")
        
        # Count trips
        cur.execute('SELECT COUNT(*) FROM trip')
        trip_count = cur.fetchone()[0]
        print(f"\n🗺️  Trips in database: {trip_count}")
        
        # Public trips
        cur.execute('''
            SELECT t.name, t.share_token, t.country, u.email 
            FROM trip t 
            JOIN user u ON t.user_id = u.id 
            WHERE t.is_public = 1
        ''')
        public_trips = cur.fetchall()
        if public_trips:
            print(f"\n🌐 Public itineraries ({len(public_trips)}):")
            for name, token, country, email in public_trips:
                print(f"  - {name} ({country}) by {email}")
                print(f"    Public URL: http://localhost:3000/trip/{token}")
        
        conn.close()
        return True
        
    except sqlite3.OperationalError as e:
        if "locked" in str(e):
            print("❌ Database is locked (backend server is running)")
            print("   Stop the backend server with Ctrl+C, then run: python seed.py")
            return False
        else:
            print(f"❌ Error: {e}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    query_db()
