"""
Identificar todos los IDs con sus países correspondientes
"""
import requests
from bs4 import BeautifulSoup
import time

BASE_URL = "https://regulatel.indotel.gob.do"

# IDs a probar (excluyendo los ya conocidos)
KNOWN_IDS = {174, 180, 183, 184, 193, 195, 199}
IDS_TO_TEST = [185, 186, 187, 188, 189, 190, 191, 192, 194, 196, 197, 198, 200]

def identify_country(detail_id):
    """Identifica el país desde una página de detalle"""
    url = f"{BASE_URL}/pagina/detalle?id={detail_id}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        title_elem = soup.find('div', class_='title-element')
        if title_elem:
            text = title_elem.get_text()
            
            country_map = {
                "Argentina": "argentina",
                "Bolivia": "bolivia",
                "Brasil": "brasil",
                "Chile": "chile",
                "Colombia": "colombia",
                "Ecuador": "ecuador",
                "México": "mexico",
                "Paraguay": "paraguay",
                "Perú": "peru",
                "República Dominicana": "rep_dominicana",
                "Uruguay": "uruguay",
            }
            
            for country_name, country_id in country_map.items():
                if country_name in text:
                    return country_id
        
        return None
    except Exception as e:
        return None

print("Identificando países para IDs desconocidos...")
print("=" * 60)

all_mappings = {
    174: "argentina",
    180: "bolivia",
    183: "brasil",
    184: "colombia",
    193: "mexico",
    195: "paraguay",
    199: "rep_dominicana",
}

for detail_id in IDS_TO_TEST:
    country = identify_country(detail_id)
    if country:
        all_mappings[detail_id] = country
        print(f"✓ ID {detail_id}: {country}")
    time.sleep(0.5)

print("\n" + "=" * 60)
print("MAPEO COMPLETO:")
print("=" * 60)

# Organizar por país
country_to_id = {}
for detail_id, country_id in all_mappings.items():
    if country_id not in country_to_id:
        country_to_id[country_id] = detail_id

for country_id in sorted(country_to_id.keys()):
    print(f"  '{country_id}': {country_to_id[country_id]},")

# Guardar
import json
with open('data/all_country_ids.json', 'w', encoding='utf-8') as f:
    json.dump(country_to_id, f, indent=2, ensure_ascii=False)

print(f"\nMapeo guardado en: data/all_country_ids.json")


