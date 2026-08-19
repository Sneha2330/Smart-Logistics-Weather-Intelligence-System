def choose_best_route(routes, weather_risk):
    best = None
    min_score = 999999

    for route in routes:
        score = weather_risk + (route["distance"] * 0.3)
        route["risk_score"] = round(score, 2)

        if score < min_score:
            min_score = score
            best = route

    for route in routes:
        route["recommended"] = 1 if route == best else 0

    return routes