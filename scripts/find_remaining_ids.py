"""
Script para encontrar los IDs faltantes
"""
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://regulatel.indotel.gob.do"

# IDs ya encontrados
KNOWN_IDS = {
    174: "argentina",
    180: "bolivia",
    183: "brasil",
    184: "colombia",
    193: "mexico",
    195: "paraguay",
}

# Países faltantes
MISSING_COUNTRIES = {
    "Chile": "chile",
    "Ecuador": "ecuador",
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
        
        # Buscar el título
        title_elem = soup.find('div', class_='title-element')
        if title_elem:
            text = title_elem.get_text()
            for country_name in MISSING_COUNTRIES.keys():
                if country_name in text:
                    return MISSING_COUNTRIES[country_name]
        
        # Buscar en todo el texto
        all_text = soup.get_text()
        for country_name in MISSING_COUNTRIES.keys():
            if country_name in all_text:
                return MISSING_COUNTRIES[country_name]
        
        return None
    except:
        return None

def main():
    """Función principal"""
    print("Buscando IDs faltantes...")
    print("=" * 50)
    
    # Probar un rango más amplio
    found = {}
    
    for detail_id in range(185, 200):
        if detail_id in KNOWN_IDS:
            continue
        
        country = identify_country_from_page(detail_id)
        if country:
            found[detail_id] = country
            print(f"✓ ID {detail_id}: {country}")
    
    print("\n" + "=" * 50)
    if found:
        print("IDs encontrados:")
        for detail_id, country in sorted(found.items()):
            print(f"  '{country}': {detail_id},")
    else:
        print("No se encontraron más IDs en el rango probado.")
        print("Intentando buscar en las páginas de países directamente...")
        
        # Intentar buscar desde las páginas de países
        country_urls = {
            "chile": "chile",
            "ecuador": "ecuador",
            "peru": "peru",
            "rep_dominicana": "rep-dominicana",
            "uruguay": "uruguay",
        }
        
        for country_id, country_url in country_urls.items():
            url = f"{BASE_URL}/pagina/mejores-practicas-regulatorias/{country_url}"
            try:
                response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Buscar enlaces a detalle
                links = soup.find_all('div', attrs={'data-url': True})
                for link in links:
                    data_url = link.get('data-url', '')
                    if 'detalle?id=' in data_url:
                        import re
                        match = re.search(r'detalle\?id=(\d+)', data_url)
                        if match:
                            detail_id = int(match.group(1))
                            if detail_id not in KNOWN_IDS.values():
                                print(f"  {country_id}: ID {detail_id} (desde página del país)")
            except:
                pass

if __name__ == "__main__":
    main()


