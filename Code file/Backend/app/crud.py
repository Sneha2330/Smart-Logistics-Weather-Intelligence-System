from datetime import datetime
from .db import get_connection
import sqlite3


def create_shipment(data):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        INSERT INTO shipments (
            shipment_code,
            origin_lat,
            origin_lon,
            dest_lat,
            dest_lon,
            vehicle_type,
            fuel_type,
            status,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["shipment_code"],
            data["origin_lat"],
            data["origin_lon"],
            data["dest_lat"],
            data["dest_lon"],
            data["vehicle_type"],
            data["fuel_type"],
            "ACTIVE",
            datetime.utcnow().isoformat()
        ))

        conn.commit()
        return {"success": True, "message": "Shipment created successfully"}

    except sqlite3.IntegrityError:
        return {"success": False, "message": "Shipment with this shipment_code already exists"}

    finally:
        conn.close()


def get_shipments():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM shipments ORDER BY id DESC")
    rows = cursor.fetchall()

    conn.close()
    return [dict(row) for row in rows]


def save_weather(shipment_id, weather):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO weather_snapshots (
        shipment_id,
        temperature,
        wind_speed,
        rain_mm,
        weather_main,
        risk_score,
        timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        shipment_id,
        weather["temp"],
        weather["wind"],
        weather["rain"],
        weather["main"],
        weather["risk"],
        datetime.utcnow().isoformat()
    ))

    conn.commit()
    conn.close()


def save_route_prediction(shipment_id, route):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO route_predictions (
        shipment_id,
        route_type,
        distance_km,
        duration_min,
        risk_score,
        recommended,
        geometry,
        timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        shipment_id,
        route["type"],
        route["distance"],
        route["duration"],
        route["risk_score"],
        route["recommended"],
        str(route["geometry"]),
        datetime.utcnow().isoformat()
    ))

    conn.commit()
    conn.close()


def save_emission(shipment_id, distance_km, fuel_liters, co2_kg, threshold_exceeded):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO emission_logs (
        shipment_id,
        distance_km,
        fuel_liters,
        co2_kg,
        threshold_exceeded,
        timestamp
    ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        shipment_id,
        distance_km,
        fuel_liters,
        co2_kg,
        threshold_exceeded,
        datetime.utcnow().isoformat()
    ))

    conn.commit()
    conn.close()