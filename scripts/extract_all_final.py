"""
Script final para extraer TODOS los datos de TODOS los países
"""
import requests
from bs4 import BeautifulSoup
import json
import re
import time

BASE_URL = "https://regulatel.indotel.gob.do"

# Todos los IDs conocidos
COUNTRY_DETAIL_IDS = {
    "argentina": 174,
    "bolivia": 180,
    "brasil": 183,
    "colombia": 184,
    "mexico": 193,
    "paraguay": 195,
    "rep_dominicana": 199,
}

# Intentar encontrar IDs faltantes desde las páginas de países
MISSING_COUNTRIES = {
    "chile": "chile",
    "ecuador": "ecuador",
    "peru": "peru",
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

def find_id_from_country_page(country_url):
    """Busca el ID desde la página del país"""
    url = f"{BASE_URL}/pagina/mejores-practicas-regulatorias/{country_url}"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar divs con data-url
        divs = soup.find_all('div', attrs={'data-url': True})
        for div in divs:
            data_url = div.get('data-url', '')
            if 'detalle?id=' in data_url:
                match = re.search(r'detalle\?id=(\d+)', data_url)
                if match:
                    return int(match.group(1))
        
        # Buscar enlaces
        links = soup.find_all('a', href=True)
        for link in links:
            href = link.get('href', '')
            if 'detalle?id=' in href:
                match = re.search(r'detalle\?id=(\d+)', href)
                if match:
                    return int(match.group(1))
        
        return None
    except:
        return None

def extract_tags(text):
    """Extrae tags relevantes del texto"""
    tags = []
    text_lower = text.lower()
    
    keyword_map = {
        "subastas": ["subasta", "licitación"],
        "5g": ["5g", "quinta generación"],
        "omv": ["omv", "operador móvil virtual"],
        "portabilidad": ["portabilidad", "portable"],
        "ciberseguridad": ["ciberseguridad", "cybersecurity"],
        "iot": ["iot", "internet de las cosas"],
        "infraestructura": ["infraestructura", "compartición"],
        "emergencia": ["emergencia", "alertas"],
        "homologación": ["homologación", "certificación"],
        "refarming": ["refarming"],
        "sandbox": ["sandbox"],
        "transparencia": ["transparencia"],
        "competencia": ["competencia"],
    }
    
    for tag, keywords in keyword_map.items():
        if any(keyword in text_lower for keyword in keywords):
            if tag not in tags:
                tags.append(tag)
    
    return tags

def extract_category_from_html(html_content, category_name):
    """Extrae el contenido de una categoría desde HTML embebido"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    category_heading = soup.find('strong', string=re.compile(category_name, re.I))
    
    if not category_heading:
        return None
    
    items = []
    current = category_heading.parent
    
    while current:
        next_elem = current.find_next_sibling()
        if not next_elem:
            break
        
        links = next_elem.find_all('a')
        for link in links:
            link_text = link.get_text(strip=True)
            if link_text and link_text not in items and len(link_text) > 5:
                items.append(link_text)
        
        text = next_elem.get_text(strip=True)
        if text and len(text) > 10:
            if category_name.lower() not in text.lower():
                items.append(text)
        
        if next_elem.find('strong'):
            strong_text = next_elem.find('strong').get_text(strip=True)
            if any(cat.lower() in strong_text.lower() for cat in CATEGORIES if cat != category_name):
                break
        
        current = next_elem
        if len(items) > 20:
            break
    
    if items:
        # Eliminar duplicados
        unique_items = []
        seen = set()
        for item in items:
            if item not in seen:
                seen.add(item)
                unique_items.append(item)
        
        all_text = " ".join(unique_items)
        summary = all_text[:200] + "..." if len(all_text) > 200 else all_text
        details = "\n".join([f"- {item}" for item in unique_items])
        
        return {
            "summary": summary,
            "details": details,
            "tags": extract_tags(all_text),
            "items": unique_items
        }
    
    return None

def extract_country_data(country_id, detail_id):
    """Extrae los datos de un país"""
    url = f"{BASE_URL}/pagina/detalle?id={detail_id}"
    print(f"\nExtrayendo {country_id} (ID: {detail_id})...")
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        content_divs = soup.find_all('div', class_='col-md-12')
        content_html = None
        
        for div in content_divs:
            text = div.get_text()
            if 'Espectro radioeléctrico' in text or 'Competencia Económica' in text:
                content_html = str(div)
                break
        
        if not content_html:
            print(f"  ✗ No se encontró contenido")
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
                practices[category] = {
                    "summary": "Información no disponible en la fuente.",
                    "details": "No se pudo extraer información específica para esta categoría.",
                    "tags": []
                }
        
        title_elem = soup.find('div', class_='title-element')
        country_name = country_id.replace('_', ' ').title()
        if title_elem:
            text = title_elem.get_text()
            country_names_map = {
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
            for name, full_name in country_names_map.items():
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
    print("EXTRACCIÓN COMPLETA DE DATOS DE TODOS LOS PAÍSES")
    print("=" * 70)
    
    # Buscar IDs faltantes
    print("\nBuscando IDs faltantes...")
    for country_id, country_url in MISSING_COUNTRIES.items():
        if country_id not in COUNTRY_DETAIL_IDS:
            detail_id = find_id_from_country_page(country_url)
            if detail_id:
                COUNTRY_DETAIL_IDS[country_id] = detail_id
                print(f"  ✓ {country_id}: ID {detail_id}")
            else:
                print(f"  ✗ {country_id}: No se encontró ID")
    
    print(f"\nExtrayendo datos de {len(COUNTRY_DETAIL_IDS)} países...")
    print("=" * 70)
    
    all_data = []
    
    for country_id, detail_id in COUNTRY_DETAIL_IDS.items():
        data = extract_country_data(country_id, detail_id)
        if data:
            all_data.append(data)
        time.sleep(2)  # Esperar entre requests
    
    if all_data:
        output_file = "data/regulatel_all_countries_complete.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n{'=' * 70}")
        print(f"Datos extraídos de {len(all_data)} países")
        print(f"Archivo guardado en: {output_file}")
        print("=" * 70)
        
        print("\nResumen por país:")
        for country_data in all_data:
            categories_found = sum(1 for p in country_data["practices"].values() 
                                  if p.get("summary") != "Información no disponible en la fuente.")
            print(f"  {country_data['name']}: {categories_found}/8 categorías")

if __name__ == "__main__":
    main()


