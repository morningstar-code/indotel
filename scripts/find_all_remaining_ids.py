"""
Buscar todos los IDs faltantes probando un rango más amplio
"""
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://regulatel.indotel.gob.do"

KNOWN_IDS = {174, 180, 183, 184, 193, 195, 199}

MISSING = {
    "Chile": "chile",
    "Ecuador": "ecuador",
    "Perú": "peru",
    "Uruguay": "uruguay",
}

print("Buscando IDs faltantes en rango 185-210...")
print("=" * 50)

found = {}

for detail_id in range(185, 210):
    if detail_id in KNOWN_IDS:
        continue
    
    url = f"{BASE_URL}/pagina/detalle?id={detail_id}"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=8)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            title_elem = soup.find('div', class_='title-element')
            if title_elem:
                text = title_elem.get_text()
                for country_name, country_id in MISSING.items():
                    if country_name in text and country_id not in found.values():
                        found[detail_id] = country_id
                        print(f"✓ ID {detail_id}: {country_id} ({country_name})")
                        break
    except:
        pass

print("\n" + "=" * 50)
if found:
    print("IDs encontrados:")
    for detail_id, country_id in sorted(found.items()):
        print(f"  '{country_id}': {detail_id},")
else:
    print("No se encontraron más IDs en el rango probado.")


