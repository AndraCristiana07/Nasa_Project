import os
import requests
import json
from datetime import datetime, timedelta

def get_artemis_full_mission():
    base_url = "https://images-api.nasa.gov/search"
    mission_start = datetime(2026, 4, 1)
    mission_end = datetime(2026, 4, 11)
    
    organized_data = {}
    
    curr = mission_start
    while curr <= mission_end:
        organized_data[curr.strftime("%Y-%m-%d")] = []
        curr += timedelta(days=1)

    print("Start scanning...")

    page = 1
    total_found = 0

    while True:
        params = {
            'q': 'Artemis II',
            'media_type': 'image',
            'year_start': '2026',
            'year_end': '2026',
            'page': page
        }

        response = requests.get(base_url, params=params)
        if response.status_code != 200:
            break
            
        data = response.json()
        items = data.get('collection', {}).get('items', [])
        
        if not items:
            break # no more pages left

        for item in items:
            metadata = item['data'][0]
            date_str = metadata.get('date_created', '')
            
            for day_key in organized_data.keys():
                day_obj = datetime.strptime(day_key, "%Y-%m-%d")
                if day_key in date_str or day_obj.strftime("%B %-d") in date_str:
                    organized_data[day_key].append(item)
                    total_found += 1
                    break
        
        print(f"Processed page {page}...")
        page += 1

    # filter out days with no photos and save
    final_output = {k: v for k, v in organized_data.items() if v}
    
    output_path = os.path.join("..", "backend", "data", "artemis_gallery.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=4)

    print(f"\nFound {total_found} images across the mission.")
    for day, media in final_output.items():
        print(f" {day}: {len(media)} items")

if __name__ == "__main__":
    get_artemis_full_mission()