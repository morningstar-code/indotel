"""
Script para extraer datos de todos los países de REGULATEL
Busca los IDs navegando directamente a cada país
"""
import requests
from bs4 import BeautifulSoup
import json
import re
import time

BASE_URL = "https://regulatel.indotel.gob.do"

# URLs conocidas de países (basadas en la estructura de URL)
COUNTRY_URLS = {
    "argentina": "argentina",
    "bolivia": "bolivia", 
    "brasil": "brasil",
    "chile": "chile",
    "colombia": "colombia",
    "ecuador": "ecuador",
    "mexico": "mexico",
    "paraguay": "paraguay",
    "peru": "peru",
    "rep_dominicana": "rep-dominicana",
    "uruguay": "uruguay",
}

CATEGORIES = [
    "Espectro radioeléctrico",
    "Competencia Económica",
    "Ciberseguridad",
    "Protección del usuario",
    "Tecnologías emergentes",
    "Compartición de la infraestructura",
    "Telecomunicaciones de emergencia",
    "Homologación de productos y dispositivos",
]

def find_detail_id_from_country_page(country_url):
    """Encuentra el ID de detalle desde la página del país"""
    url = f"{BASE_URL}/pagina/mejores-practicas-regulatorias/{country_url}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar enlaces a detalle
        links = soup.find_all('a', href=True)
        for link in links:
            href = link.get('href', '')
            if 'detalle?id=' in href:
                match = re.search(r'detalle\?id=(\d+)', href)
                if match:
                    return int(match.group(1))
        
        # Si no encontramos enlace directo, buscar en data-url
        divs = soup.find_all('div', attrs={'data-url': True})
        for div in divs:
            data_url = div.get('data-url', '')
            if 'detalle?id=' in data_url:
                match = re.search(r'detalle\?id=(\d+)', data_url)
                if match:
                    return int(match.group(1))
        
        return None
    except Exception as e:
        print(f"Error buscando ID para {country_url}: {e}")
        return None

def extract_tags(text):
    """Extrae tags relevantes del texto"""
    tags = []
    text_lower = text.lower()
    
    keyword_map = {
        "subastas": ["subasta", "licitación", "asignación competitiva"],
        "5g": ["5g", "quinta generación"],
        "omv": ["omv", "operador móvil virtual"],
        "portabilidad": ["portabilidad", "portable"],
        "ciberseguridad": ["ciberseguridad", "cybersecurity", "seguridad digital"],
        "iot": ["iot", "internet de las cosas"],
        "infraestructura": ["infraestructura", "compartición"],
        "emergencia": ["emergencia", "alertas"],
        "homologación": ["homologación", "certificación"],
        "refarming": ["refarming", "reutilización"],
        "sandbox": ["sandbox"],
        "transparencia": ["transparencia"],
        "competencia": ["competencia"],
        "proteccion_datos": ["protección de datos", "datos personales"],
    }
    
    for tag, keywords in keyword_map.items():
        if any(keyword in text_lower for keyword in keywords):
            if tag not in tags:
                tags.append(tag)
    
    return tags

def extract_category_from_html(html_content, category_name):
    """Extrae el contenido de una categoría desde HTML embebido"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Buscar el strong con el nombre de la categoría
    category_heading = soup.find('strong', string=re.compile(category_name, re.I))
    
    if not category_heading:
        return None
    
    items = []
    
    # Buscar todos los enlaces después del heading
    current = category_heading.parent
    while current:
        next_elem = current.find_next_sibling()
        if not next_elem:
            break
        
        # Si encontramos enlaces
        links = next_elem.find_all('a')
        for link in links:
            link_text = link.get_text(strip=True)
            if link_text and link_text not in items and len(link_text) > 5:
                items.append(link_text)
        
        # Si encontramos texto directo
        text = next_elem.get_text(strip=True)
        if text and len(text) > 10:
            if category_name.lower() not in text.lower():
                items.append(text)
        
        # Buscar si hay otro heading (otra categoría)
        if next_elem.find('strong'):
            strong_text = next_elem.find('strong').get_text(strip=True)
            if any(cat.lower() in strong_text.lower() for cat in CATEGORIES if cat != category_name):
                break
        
        current = next_elem
        if len(items) > 20:
            break
    
    if items:
        all_text = " ".join(items)
        summary = all_text[:200] + "..." if len(all_text) > 200 else all_text
        details = "\n".join([f"- {item}" for item in items])
        
        return {
            "summary": summary,
            "details": details,
            "tags": extract_tags(all_text),
            "items": items
        }
    
    return None

def extract_country_data(country_id, country_url, detail_id=None):
    """Extrae los datos de un país"""
    # Si no tenemos el ID, intentar encontrarlo
    if not detail_id:
        print(f"  Buscando ID de detalle para {country_id}...")
        detail_id = find_detail_id_from_country_page(country_url)
        if not detail_id:
            print(f"  ✗ No se pudo encontrar ID de detalle para {country_id}")
            return None
    
    url = f"{BASE_URL}/pagina/detalle?id={detail_id}"
    print(f"\nExtrayendo datos de {country_id} (ID: {detail_id})...")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar el div con el contenido principal
        content_divs = soup.find_all('div', class_='col-md-12')
        content_html = None
        
        for div in content_divs:
            text = div.get_text()
            if 'Espectro radioeléctrico' in text or 'Competencia Económica' in text:
                content_html = str(div)
                break
        
        if not content_html:
            print(f"  ✗ No se encontró el contenido principal")
            return None
        
        practices = {}
        for category in CATEGORIES:
            category_data = extract_category_from_html(content_html, category)
            if category_data and category_data.get('items'):
                practices[category] = {
                    "summary": category_data['summary'],
                    "details": category_data['details'],
                    "tags": category_data['tags']
                }
                print(f"  ✓ {category}: {len(category_data['items'])} items")
            else:
                print(f"  ✗ {category}: No encontrado")
                practices[category] = {
                    "summary": "Información no disponible en la fuente.",
                    "details": "No se pudo extraer información específica para esta categoría desde la página web de REGULATEL.",
                    "tags": []
                }
        
        # Extraer nombre del país
        title_elem = soup.find('div', class_='title-element')
        country_name = country_id.replace('_', ' ').title()
        if title_elem:
            text = title_elem.get_text()
            # Intentar identificar el país
            country_names = {
                "Argentina": "Argentina",
                "Bolivia": "Bolivia",
                "Brasil": "Brasil",
                "Chile": "Chile",
                "Colombia": "Colombia",
                "Ecuador": "Ecuador",
                "México": "México",
                "Paraguay": "Paraguay",
                "Perú": "Perú",
                "República Dominicana": "República Dominicana",
                "Uruguay": "Uruguay",
            }
            for name, full_name in country_names.items():
                if name in text:
                    country_name = full_name
                    break
        
        return {
            "id": country_id,
            "name": country_name,
            "practices": practices
        }
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def main():
    """Función principal"""
    print("=" * 70)
    print("EXTRACTOR DE DATOS DE TODOS LOS PAÍSES DE REGULATEL")
    print("=" * 70)
    
    # IDs conocidos (Argentina ya lo tenemos)
    known_ids = {
        "argentina": 174,
    }
    
    all_data = []
    
    for country_id, country_url in COUNTRY_URLS.items():
        detail_id = known_ids.get(country_id)
        data = extract_country_data(country_id, country_url, detail_id)
        if data:
            all_data.append(data)
        time.sleep(2)  # Esperar entre requests
    
    if all_data:
        output_file = "data/regulatel_all_countries.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=2, ensure_ascii=False)
        print(f"\n{'=' * 70}")
        print(f"Datos extraídos de {len(all_data)} países")
        print(f"Archivo guardado en: {output_file}")
        print("=" * 70)
        
        # Resumen
        for country_data in all_data:
            categories_found = sum(1 for p in country_data["practices"].values() 
                                  if p.get("summary") != "Información no disponible en la fuente.")
            print(f"{country_data['name']}: {categories_found}/8 categorías")

if __name__ == "__main__":
    main()


