EMISSION_FACTOR = {
    "diesel": 2.68,
    "petrol": 2.31
}


def calculate_emission(distance_km, fuel_type):
    fuel_type = fuel_type.lower()
    fuel_used = distance_km * 0.2
    co2 = fuel_used * EMISSION_FACTOR.get(fuel_type, 2.5)
    return round(fuel_used, 2), round(co2, 2)