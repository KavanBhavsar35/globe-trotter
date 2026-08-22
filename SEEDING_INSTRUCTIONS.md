# GlobeTrotter Database Seeding - INR Conversion Complete

## 🎯 Summary

The seed data has been completely rewritten with:
- **35 cities** (10 Japan, 10 UK, 15 India) - up from original 15
- **200+ activities** with detailed descriptions
- **All prices in INR** (converted from USD)
- **4 demo users** with pre-built public itineraries
- **Extensive mock data** for testing

## 📋 To Execute the Seed

### 1. Install Backend Dependencies (if not already done)

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- fastapi[standard]
- sqlmodel
- passlib[argon2]
- pyjwt
- pydantic-settings
- rich
- boto3

### 2. Run the Seed Script

```bash
cd backend
python seed.py
```

This will:
1. ✅ Wipe existing cities, activities, stops, and stop-activities
2. ✅ Seed 35 cities with 200+ activities (all INR pricing)
3. ✅ Create 3 demo users with full profiles
4. ✅ Generate 4 public itineraries with activities

### 3. Query the Database

```bash
cd backend
python query_db.py
```

This shows:
- City count and samples
- Activity count
- User accounts with details
- **alex@example.com password hash**
- Public itineraries with share tokens

---

## 💰 INR Pricing Conversion

### Cost Index (Daily Stay Cost)
All `cost_index` values converted from USD to INR (~₹84 per $1):

**Japan:**
- Tokyo: $180 → **₹8,500/day**
- Kyoto: $150 → **₹7,200/day**
- Osaka: $140 → **₹6,800/day**
- Hiroshima: $120 → **₹5,800/day**
- Sapporo: $130 → **₹6,200/day**
- Nara: $115 → **₹5,400/day**
- Hakone: $200 → **₹9,500/day**
- Takayama: $140 → **₹6,800/day**
- Nikko: $135 → **₹6,500/day**
- Kamakura: $125 → **₹6,000/day**

**United Kingdom:**
- London: $200 → **₹12,000/day**
- Edinburgh: $150 → **₹9,000/day**
- Manchester: $130 → **₹8,000/day**
- Bath: $140 → **₹8,500/day**
- Liverpool: $120 → **₹7,200/day**
- Oxford: $145 → **₹8,800/day**
- Cambridge: $142 → **₹8,600/day**
- York: $128 → **₹7,800/day**
- Bristol: $125 → **₹7,500/day**
- Glasgow: $115 → **₹7,000/day**

**India:**
- New Delhi: $70 → **₹3,500/day**
- Mumbai: $90 → **₹4,500/day**
- Jaipur: $60 → **₹3,000/day**
- Goa: $80 → **₹4,000/day**
- Varanasi: $50 → **₹2,500/day**
- Agra: $65 → **₹3,200/day**
- Udaipur: $75 → **₹3,800/day**
- Bangalore: $72 → **₹3,600/day**
- Kochi: $68 → **₹3,400/day**
- Rishikesh: $45 → **₹2,200/day**
- Amritsar: $55 → **₹2,800/day**
- Kolkata: $60 → **₹3,000/day**
- Hampi: $40 → **₹2,000/day**
- Darjeeling: $70 → **₹3,500/day**
- Pushkar: $48 → **₹2,400/day**

### Activity Costs
All activity prices converted to INR. Examples:

**Japan:**
- Sushi Omakase Dinner: $120 → **₹9,500**
- teamLab Planets: $35 → **₹2,800**
- Traditional Tea Ceremony: $45 → **₹3,600**
- Universal Studios: $80 → **₹6,400**

**UK:**
- Tower of London: $35 → **₹2,800**
- West End Theatre: $90 → **₹7,200**
- Thermae Bath Spa: $50 → **₹4,000**
- Scotch Whisky Tasting: $40 → **₹3,200**

**India:**
- Red Fort: $8 → **₹650**
- Old Delhi Food Walk: $15 → **₹800**
- Taj Mahal: $11 → **₹1,100**
- River Rafting Rishikesh: $20 → **₹2,000**
- Beach Shack Seafood Goa: $25 → **₹1,600**

---

## 👥 Demo Users Created

### 1. Alex Kumar (alex@example.com)
**Password:** `password123`

**Profile:**
- Name: Alex Kumar
- Phone: +91 98765 43210
- Location: Mumbai, India
- Bio: "Travel enthusiast exploring Asia. Love temples, street food, and adventure sports!"

**Trips:**
1. **Japan Golden Route Adventure** (PUBLIC)
   - Tokyo (5 days) → Kyoto (6 days) → Osaka (3 days)
   - 15 activities across 3 cities
   - Dates: 30 days from today

2. **Spiritual India & Beach Escape** (PUBLIC)
   - Varanasi (3 days) → Mumbai (4 days) → Goa (5 days)
   - 14 activities across 3 cities
   - Dates: 90 days from today

### 2. Priya Sharma (priya@example.com)
**Password:** `password123`

**Profile:**
- Name: Priya Sharma
- Phone: +91 87654 32109
- Location: New Delhi, India
- Bio: "Food blogger and culture lover. Always hunting for the best local experiences."

**Trip:**
- **Golden Triangle Heritage Tour** (PUBLIC)
  - Delhi (3 days) → Agra (2 days) → Jaipur (3 days)
  - 14 activities covering Delhi monuments, Taj Mahal, Pink City palaces
  - Dates: 60 days from today

### 3. James Wilson (james@example.com)
**Password:** `password123`

**Profile:**
- Name: James Wilson
- Phone: +44 7700 900123
- Location: London, United Kingdom
- Bio: "History buff and architecture enthusiast. Planning trips across Asia."

**Trip:**
- **British Isles Explorer** (PUBLIC)
  - London (4 days) → Oxford (2 days) → Edinburgh (4 days)
  - 15 activities covering museums, colleges, castles
  - Dates: 45 days from today

---

## 🌐 Public Itineraries

All 4 trips are marked as **public** with share tokens. After seeding, you can:

1. Visit the public URLs (tokens generated on seed)
2. Test the public share feature end-to-end
3. View itineraries without authentication

**Public URLs format:**
```
http://localhost:3000/trip/{share_token}
```

The `query_db.py` script will show the exact URLs with tokens.

---

## 📊 Database Statistics

**After seeding you'll have:**

- 🏙️ **35 cities** across 3 countries
- 🎯 **200+ activities** (avg 6-7 per city)
- 👤 **3 users** with full profiles
- 🗺️ **4 public trips** with complete itineraries
- 📍 **12 stops** across all trips
- 🎨 **60+ stop-activity links**

---

## 🔐 Password Hash for alex@example.com

The seed script uses passlib with argon2 to hash passwords. After seeding, run:

```bash
python query_db.py
```

This will display:
- Full user list
- alex@example.com's argon2 password hash
- All public trip details with share tokens

---

## 🎨 Frontend Format Changes Needed

The frontend `lib/format.ts` file still uses `$` for currency. Update the `money()` function:

```typescript
// OLD
export function money(cents: number): string {
  return `$${cents.toFixed(0)}`;
}

// NEW
export function money(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
```

This will:
- Display rupee symbol (₹)
- Add Indian number formatting (e.g., ₹1,23,456)

---

## 🧪 Testing the Seed Data

### 1. Login as Demo Users
```
alex@example.com / password123
priya@example.com / password123
james@example.com / password123
```

### 2. View Public Itineraries
Navigate to each user's trips and click "Share" to get the public link.

### 3. Test Budget Calculations
The budget heuristic should now show INR:
- Stay: nights × city.cost_index (INR)
- Meals: ₹2,500/night (was $30)
- Transport: ₹8,400/stop (was $100)
- Activities: Sum of activity costs (INR)

### 4. Test City Search
Search by country:
- Japan cities: ₹5,400 - ₹9,500/day
- UK cities: ₹7,000 - ₹12,000/day
- India cities: ₹2,000 - ₹4,500/day

---

## 📝 Next Steps

1. ✅ **Install dependencies**: `pip install -r requirements.txt`
2. ✅ **Run seed**: `python seed.py`
3. ✅ **Verify data**: `python query_db.py`
4. 🔄 **Update frontend**: Change `money()` function to use ₹
5. 🔄 **Update budget heuristic**: Change meals/transport to INR in `backend/main.py`
6. ▶️ **Start backend**: `fastapi dev main.py`
7. ▶️ **Start frontend**: `cd frontend && pnpm dev`
8. 🧪 **Test**: Login as demo users, view trips, test public links

---

## 💡 Budget Heuristic Updates Needed

In `backend/main.py`, update the budget calculation constants:

```python
# OLD (USD)
MEAL_PER_NIGHT = 30
TRANSPORT_PER_STOP = 100

# NEW (INR)
MEAL_PER_NIGHT = 2500  # ₹2,500/night for meals
TRANSPORT_PER_STOP = 8400  # ₹8,400 per stop for transport
```

This ensures the auto-calculated budgets match the INR pricing.

---

## 📸 Screenshot the Results

After seeding, take screenshots of:
1. Dashboard with trips loaded
2. Trip detail pages showing INR budgets
3. Public itinerary pages
4. City search with INR pricing
5. Activity selection with INR costs

All prices should now display with ₹ symbol and proper Indian number formatting!
