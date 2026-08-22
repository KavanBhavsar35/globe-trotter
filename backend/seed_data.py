# Seed catalog: cities + their activities. Loaded on startup if City table empty.
# (city_name, country, cost_index_usd_per_day, [ (activity, type, cost, hours) ... ])

CITIES = [
    ("Paris", "France", 180, [
        ("Louvre Museum", "culture", 20, 3),
        ("Eiffel Tower Summit", "sightseeing", 30, 2),
        ("Seine River Cruise", "relax", 18, 1),
        ("Montmartre Food Walk", "food", 45, 3),
    ]),
    ("Tokyo", "Japan", 160, [
        ("Shibuya Crossing & Shopping", "sightseeing", 0, 2),
        ("Sushi Making Class", "food", 70, 3),
        ("teamLab Digital Art", "culture", 32, 2),
        ("Mt. Takao Day Hike", "adventure", 15, 5),
    ]),
    ("Bangkok", "Thailand", 60, [
        ("Grand Palace Tour", "culture", 15, 3),
        ("Street Food Tuk-Tuk Night", "food", 40, 3),
        ("Floating Market Trip", "sightseeing", 25, 4),
        ("Thai Massage & Spa", "relax", 20, 2),
    ]),
    ("New York", "USA", 220, [
        ("Statue of Liberty Ferry", "sightseeing", 25, 3),
        ("Broadway Show", "culture", 120, 3),
        ("Central Park Bike", "adventure", 18, 2),
        ("Brooklyn Pizza Crawl", "food", 50, 2),
    ]),
    ("Rome", "Italy", 140, [
        ("Colosseum & Forum", "culture", 28, 3),
        ("Vatican Museums", "culture", 30, 3),
        ("Trastevere Food Tour", "food", 55, 3),
        ("Vespa City Ride", "adventure", 60, 2),
    ]),
    ("Barcelona", "Spain", 130, [
        ("Sagrada Familia", "culture", 26, 2),
        ("Tapas & Wine Tasting", "food", 48, 3),
        ("Montjuic Cable Car", "sightseeing", 14, 1),
        ("Costa Brava Kayak", "adventure", 65, 5),
    ]),
    ("Bali", "Indonesia", 70, [
        ("Ubud Rice Terraces", "sightseeing", 10, 3),
        ("Surf Lesson Kuta", "adventure", 35, 2),
        ("Balinese Cooking Class", "food", 30, 3),
        ("Spa & Yoga Retreat", "relax", 40, 3),
    ]),
    ("Dubai", "UAE", 200, [
        ("Burj Khalifa Deck", "sightseeing", 45, 2),
        ("Desert Safari", "adventure", 75, 6),
        ("Gold Souk & Dhow Dinner", "food", 60, 3),
        ("Dubai Mall Aquarium", "culture", 30, 2),
    ]),
    ("Istanbul", "Turkey", 90, [
        ("Hagia Sophia & Blue Mosque", "culture", 25, 3),
        ("Bosphorus Cruise", "relax", 22, 2),
        ("Grand Bazaar Food Walk", "food", 35, 3),
        ("Hot Air Balloon (Cappadocia trip)", "adventure", 180, 4),
    ]),
    ("London", "UK", 190, [
        ("British Museum", "culture", 0, 3),
        ("London Eye", "sightseeing", 40, 1),
        ("West End Show", "culture", 90, 3),
        ("Borough Market Tasting", "food", 45, 2),
    ]),
    ("Cape Town", "South Africa", 85, [
        ("Table Mountain Cableway", "sightseeing", 30, 3),
        ("Cape Peninsula Drive", "adventure", 70, 6),
        ("Winelands Tasting", "food", 55, 4),
        ("Robben Island Ferry", "culture", 35, 4),
    ]),
    ("Sydney", "Australia", 175, [
        ("Opera House Tour", "culture", 40, 2),
        ("Bondi to Coogee Walk", "adventure", 0, 3),
        ("Harbour Bridge Climb", "adventure", 250, 4),
        ("Fish Market Lunch", "food", 40, 2),
    ]),
    ("Lisbon", "Portugal", 100, [
        ("Belem Tower & Monastery", "culture", 18, 3),
        ("Tram 28 & Alfama Walk", "sightseeing", 5, 2),
        ("Pastel de Nata Tasting", "food", 20, 1),
        ("Sintra Day Trip", "adventure", 45, 6),
    ]),
    ("Kyoto", "Japan", 150, [
        ("Fushimi Inari Shrine", "culture", 0, 3),
        ("Arashiyama Bamboo Grove", "sightseeing", 0, 2),
        ("Tea Ceremony", "culture", 45, 2),
        ("Kaiseki Dinner", "food", 90, 2),
    ]),
    ("Marrakech", "Morocco", 65, [
        ("Jemaa el-Fnaa Night Market", "food", 25, 3),
        ("Majorelle Garden", "relax", 15, 2),
        ("Atlas Mountains Trek", "adventure", 60, 7),
        ("Medina Souk Tour", "culture", 20, 3),
    ]),
]
