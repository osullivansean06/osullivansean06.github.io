import pandas as pd
import json

# Load the Excel file
excel_path = "data.xlsx"  # Path to your Excel file
df = pd.read_excel(excel_path, sheet_name='Sheet1')

# Helper function to convert each row into a GeoJSON feature
def row_to_feature(row):
    try:
        lat, lon = map(float, row['Coords'].split(','))
        properties = {
            "crag": row['Crag'],
            "sector": row['Sector'],
            "route": row['Route'],
            "grade": row['Grade'],
            "year": int(row['Year']),
            "climber1": row['Climber1'],
            "climber2": row.get('Climber2', ''),
            "climber3": row.get('Climber3', '')
        }
        return {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": properties
        }
    except Exception as e:
        print(f"Skipping row due to error: {e}")
        return None

# Convert all rows
features = [row_to_feature(row) for _, row in df.iterrows()]
features = [f for f in features if f]  # Remove None entries

# Create final GeoJSON
geojson = {
    "type": "FeatureCollection",
    "features": features
}

# Save to file
output_file = "climbs.geojson"
with open(output_file, 'w') as f:
    json.dump(geojson, f, indent=2)

print(f"GeoJSON file saved to: {output_file}")