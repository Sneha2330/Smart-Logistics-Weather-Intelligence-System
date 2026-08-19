from .db import get_connection


def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_code TEXT UNIQUE,
        origin_lat REAL,
        origin_lon REAL,
        dest_lat REAL,
        dest_lon REAL,
        vehicle_type TEXT,
        fuel_type TEXT,
        status TEXT,
        created_at TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS weather_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_id INTEGER,
        temperature REAL,
        wind_speed REAL,
        rain_mm REAL,
        weather_main TEXT,
        risk_score REAL,
        timestamp TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS route_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_id INTEGER,
        route_type TEXT,
        distance_km REAL,
        duration_min REAL,
        risk_score REAL,
        recommended INTEGER,
        geometry TEXT,
        timestamp TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emission_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_id INTEGER,
        distance_km REAL,
        fuel_liters REAL,
        co2_kg REAL,
        threshold_exceeded INTEGER,
        timestamp TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_id INTEGER,
        type TEXT,
        severity TEXT,
        message TEXT,
        created_at TEXT,
        acknowledged INTEGER DEFAULT 0
    )
    """)

    conn.commit()
    conn.close()