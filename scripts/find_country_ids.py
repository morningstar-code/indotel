"""
Script para encontrar los IDs de página de detalle de todos los países
"""
import requests
from bs4 import BeautifulSoup
import re

BASE_URL = "https://regulatel.indotel.gob.do"

def find_country_ids():
    """Encuentra los IDs de detalle de todos los países"""
    url = f"{BASE_URL}/pagina/mejores-practicas-regulatorias"
    
    print("Buscando IDs de países en la página principal...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, headers=headers, timeout=15)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Buscar todos los enlaces que contengan "detalle?id="
    all_links = soup.find_all('a', href=True)
    detail_links = []
    
    for link in all_links:
        href = link.get('href', '')
        if 'detalle?id=' in href:
            # Extraer el ID
            match = re.search(r'detalle\?id=(\d+)', href)
            if match:
                detail_id = int(match.group(1))
                # Intentar identificar el país por el texto del enlace o imagen
                link_text = link.get_text(strip=True)
                img = link.find('img')
                alt_text = img.get('alt', '') if img else ''
                
                detail_links.append({
                    'id': detail_id,
                    'href': href,
                    'text': link_text,
                    'alt': alt_text
                })
    
    # Eliminar duplicados
    seen_ids = set()
    unique_links = []
    for link in detail_links:
        if link['id'] not in seen_ids:
            seen_ids.add(link['id'])
            unique_links.append(link)
    
    print(f"\nEncontrados {len(unique_links)} IDs únicos:")
    for link in unique_links:
        print(f"  ID {link['id']}: {link['text'][:50]}... (alt: {link['alt'][:30]})")
    
    return unique_links

if __name__ == "__main__":
    links = find_country_ids()
    
    # Crear un mapeo básico basado en los IDs conocidos
    country_mapping = {
        174: "argentina",  # Ya sabemos que este es Argentina
    }
    
    print("\nMapeo sugerido (necesita verificación manual):")
    for link in links:
        if link['id'] not in country_mapping:
            print(f"  {link['id']}: ? (verificar manualmente)")


