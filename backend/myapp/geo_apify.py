import requests , os
api_key = os.getenv('GEO_APIFY')

def geocode_address(address, api_key):
    geocode_url = f"https://api.geoapify.com/v1/geocode/search?text={address}&apiKey={api_key}"
    response = requests.get(geocode_url)
    data = response.json()
    if data['features']:
        coords = data['features'][0]['geometry']['coordinates']
        return coords[1], coords[0]
    else:
        raise ValueError(f"Address '{address}' not found.")

def calculate_travel_time(start_address, end_address, api_key, mode='drive'):
    # Geocode the start and end addresses
    start_lat, start_lon = geocode_address(start_address, api_key)
    end_lat, end_lon = geocode_address(end_address, api_key)

    # Construct the Routing API URL
    routing_url = f"https://api.geoapify.com/v1/routing?waypoints={start_lat},{start_lon}|{end_lat},{end_lon}&mode={mode}&apiKey={api_key}"

    # Make the request to the Routing API
    response = requests.get(routing_url)
    data = response.json()

    # Extract travel time (in seconds) 
    if data.get('features'):
        travel_time_seconds = data['features'][0]['properties']['time']
        return travel_time_seconds
    else:
        raise ValueError("Route not found.")

def get_travel_time(start_address, end_address):
    global api_key
    try:
        travel_time = calculate_travel_time(start_address, end_address, api_key)
        travel_time_minutes = travel_time / 60
        return travel_time_minutes
    except ValueError as e:
        return 0

def calculate_travel_time_from_coords(start_lat, start_lon, end_address, api_key, mode='drive'):
    # Geocode the end address
    end_lat, end_lon = geocode_address(end_address, api_key)

    # Construct the Routing API URL
    routing_url = f"https://api.geoapify.com/v1/routing?waypoints={start_lat},{start_lon}|{end_lat},{end_lon}&mode={mode}&apiKey={api_key}"

    # Make the request to the Routing API
    response = requests.get(routing_url)
    data = response.json()

    # Extract travel time (in seconds)
    if data.get('features'):
        travel_time_seconds = data['features'][0]['properties']['time']
        return travel_time_seconds
    else:
        raise ValueError("Route not found.")

def get_travel_time_from_coords(start_lat, start_lon, end_address):
    global api_key
    try:
        travel_time = calculate_travel_time_from_coords(start_lat, start_lon, end_address, api_key)
        travel_time_minutes = travel_time / 60
        return travel_time_minutes
    except ValueError as e:
        # Return a large number to indicate failure, so validation fails
        return float('inf')