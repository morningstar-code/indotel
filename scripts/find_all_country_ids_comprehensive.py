"""
Script comprehensivo para encontrar TODOS los IDs de países
"""
import requests
from bs4 import BeautifulSoup
import re
import time

BASE_URL = "https://regulatel.indotel.gob.do"

# IDs conocidos
KNOWN_IDS = {
    174: "argentina",
    180: "bolivia",
    183: "brasil",
    184: "colombia",
    193: "mexico",
    195: "paraguay",
    199: "rep_dominicana",
}

# Países faltantes
MISSING_COUNTRIES = {
    "Chile": "chile",
    "Ecuador": "ecuador",
    "Perú": "peru",
    "Uruguay": "uruguay",
}

def identify_country_from_page(detail_id):
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
        
        # Buscar el título
        title_elem = soup.find('div', class_='title-element')
        if title_elem:
            text = title_elem.get_text()
            
            # Buscar todos los países posibles
            all_countries = {
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
            
            for country_name, country_id in all_countries.items():
                if country_name in text:
                    return country_id
        
        return None
    except:
        return None

def main():
    """Función principal"""
    print("=" * 70)
    print("BÚSQUEDA COMPREHENSIVA DE IDs DE PAÍSES")
    print("=" * 70)
    
    found_ids = KNOWN_IDS.copy()
    
    # Probar un rango amplio
    print("\nBuscando en rango 170-220...")
    for detail_id in range(170, 220):
        if detail_id in found_ids.values() or detail_id in found_ids:
            continue
        
        country = identify_country_from_page(detail_id)
        if country and country not in found_ids.values():
            # Verificar que no esté duplicado
            if detail_id not in found_ids:
                found_ids[detail_id] = country
                print(f"  ✓ ID {detail_id}: {country}")
        time.sleep(0.5)  # Pequeña pausa para no sobrecargar
    
    print("\n" + "=" * 70)
    print("MAPEO COMPLETO DE IDs:")
    print("=" * 70)
    
    # Organizar por país
    country_to_id = {}
    for detail_id, country_id in found_ids.items():
        country_to_id[country_id] = detail_id
    
    for country_id in sorted(country_to_id.keys()):
        print(f"  '{country_id}': {country_to_id[country_id]},")
    
    # Verificar países faltantes
    print("\n" + "=" * 70)
    print("PAÍSES FALTANTES:")
    print("=" * 70)
    missing = []
    for country_name, country_id in MISSING_COUNTRIES.items():
        if country_id not in country_to_id:
            missing.append((country_name, country_id))
            print(f"  ✗ {country_name} ({country_id})")
        else:
            print(f"  ✓ {country_name} ({country_id}): ID {country_to_id[country_id]}")
    
    return country_to_id

if __name__ == "__main__":
    all_ids = main()
    
    # Guardar el mapeo
    import json
    with open('data/country_ids_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(all_ids, f, indent=2, ensure_ascii=False)
    print(f"\nMapeo guardado en: data/country_ids_mapping.json")


