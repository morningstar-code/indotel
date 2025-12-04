"""
Script para encontrar y extraer datos de los países faltantes
"""
import requests
from bs4 import BeautifulSoup
import time

BASE_URL = "https://regulatel.indotel.gob.do"

# IDs a probar
IDS_TO_TEST = [185, 186, 187, 188, 189, 190, 191, 192, 194, 196, 197, 198, 200]

# Países faltantes
MISSING = {
    "Chile": "chile",
    "Ecuador": "ecuador",
    "Perú": "peru",
    "Uruguay": "uruguay",
}

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
        
        # Buscar en el título
        title_elem = soup.find('div', class_='title-element')
        if title_elem:
            text = title_elem.get_text()
            
            # Buscar nombres de países
            for country_name, country_id in MISSING.items():
                if country_name in text:
                    return country_id
        
        # Buscar en todo el contenido
        all_text = soup.get_text()
        for country_name, country_id in MISSING.items():
            if country_name in all_text and "SUBTEL" in all_text and country_id == "chile":
                return "chile"
            elif country_name in all_text and "ARCOTEL" in all_text and country_id == "ecuador":
                return "ecuador"
            elif country_name in all_text and "OSIPTEL" in all_text and country_id == "peru":
                return "peru"
            elif country_name in all_text and "URSEC" in all_text and country_id == "uruguay":
                return "uruguay"
        
        return None
    except:
        return None

print("Buscando países faltantes...")
print("=" * 60)

found = {}
for detail_id in IDS_TO_TEST:
    country = identify_country(detail_id)
    if country:
        found[detail_id] = country
        print(f"✓ ID {detail_id}: {country}")
    time.sleep(0.3)

if found:
    print("\n" + "=" * 60)
    print("IDs encontrados:")
    for detail_id, country_id in sorted(found.items()):
        print(f"  '{country_id}': {detail_id},")
else:
    print("\nNo se encontraron IDs en el primer intento.")
    print("Buscando por nombres de entidades regulatorias...")
    
    # Buscar por nombres de entidades
    entity_keywords = {
        "chile": ["SUBTEL", "Subsecretaría"],
        "ecuador": ["ARCOTEL", "Agencia de Regulación"],
        "peru": ["OSIPTEL", "Organismo Supervisor"],
        "uruguay": ["URSEC", "Unidad Reguladora"],
    }
    
    for detail_id in IDS_TO_TEST:
        url = f"{BASE_URL}/pagina/detalle?id={detail_id}"
        try:
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
            if response.status_code == 200:
                text = response.text
                for country_id, keywords in entity_keywords.items():
                    if all(kw in text for kw in keywords):
                        found[detail_id] = country_id
                        print(f"✓ ID {detail_id}: {country_id} (por entidad regulatoria)")
                        break
        except:
            pass


