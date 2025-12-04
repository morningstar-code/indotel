"""
Script para encontrar los IDs correctos de todos los países
Probando IDs conocidos y buscando en las páginas
"""
import requests
from bs4 import BeautifulSoup
import re

BASE_URL = "https://regulatel.indotel.gob.do"

# IDs potenciales encontrados en el HTML
POTENTIAL_IDS = [174, 180, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]

# Nombres de países para identificar
COUNTRY_NAMES = {
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

def identify_country_from_page(detail_id):
    """Identifica el país desde una página de detalle"""
    url = f"{BASE_URL}/pagina/detalle?id={detail_id}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar el título o nombre del país
        title_elem = soup.find('div', class_='title-element')
        if title_elem:
            text = title_elem.get_text()
            for country_name, country_id in COUNTRY_NAMES.items():
                if country_name in text:
                    return country_id
        
        # Buscar en todo el texto
        all_text = soup.get_text()
        for country_name, country_id in COUNTRY_NAMES.items():
            if country_name in all_text:
                return country_id
        
        return None
    except:
        return None

def main():
    """Función principal"""
    print("Buscando IDs de países...")
    print("=" * 50)
    
    country_ids = {}
    
    for detail_id in POTENTIAL_IDS:
        country = identify_country_from_page(detail_id)
        if country:
            country_ids[country] = detail_id
            print(f"✓ ID {detail_id}: {country}")
    
    print("\n" + "=" * 50)
    print("Mapeo encontrado:")
    for country, detail_id in sorted(country_ids.items()):
        print(f"  '{country}': {detail_id},")
    
    return country_ids

if __name__ == "__main__":
    main()


