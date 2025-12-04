"""
Script para encontrar los IDs faltantes buscando en las páginas de países
"""
import requests
from bs4 import BeautifulSoup
import re

BASE_URL = "https://regulatel.indotel.gob.do"

countries = {
    'chile': 'chile',
    'ecuador': 'ecuador', 
    'peru': 'peru',
    'uruguay': 'uruguay'
}

print("Buscando IDs en páginas de países...")
print("=" * 50)

found_ids = {}

for country_id, country_url in countries.items():
    url = f"{BASE_URL}/pagina/mejores-practicas-regulatorias/{country_url}"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Buscar divs con data-url
        links = soup.find_all('div', attrs={'data-url': True})
        for link in links:
            data_url = link.get('data-url', '')
            if 'detalle?id=' in data_url:
                match = re.search(r'detalle\?id=(\d+)', data_url)
                if match:
                    detail_id = int(match.group(1))
                    found_ids[country_id] = detail_id
                    print(f"✓ {country_id}: ID {detail_id}")
                    break
    except Exception as e:
        print(f"✗ Error con {country_id}: {e}")

print("\n" + "=" * 50)
print("IDs encontrados:")
for country_id, detail_id in sorted(found_ids.items()):
    print(f"  '{country_id}': {detail_id},")


