"""
Script final para extraer datos reales de REGULATEL
Extrae información de las páginas de detalle correctamente
"""
import requests
from bs4 import BeautifulSoup
import json
import re
import html

BASE_URL = "https://regulatel.indotel.gob.do"

# Mapeo de países con sus IDs de página de detalle
# Estos IDs se encuentran navegando desde la página principal
COUNTRY_DETAIL_IDS = {
    "argentina": 174,
    # Nota: Se necesitan encontrar los IDs para los demás países
    # navegando desde https://regulatel.indotel.gob.do/pagina/mejores-practicas-regulatorias
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
        # Buscar el siguiente elemento
        next_elem = current.find_next_sibling()
        if not next_elem:
            break
        
        # Si encontramos enlaces
        links = next_elem.find_all('a')
        for link in links:
            link_text = link.get_text(strip=True)
            if link_text and link_text not in items:
                items.append(link_text)
        
        # Si encontramos texto directo
        text = next_elem.get_text(strip=True)
        if text and len(text) > 10 and text not in items:
            # Verificar que no sea solo el nombre de la categoría
            if category_name.lower() not in text.lower():
                items.append(text)
        
        # Buscar si hay otro heading (otra categoría)
        if next_elem.find('strong'):
            strong_text = next_elem.find('strong').get_text(strip=True)
            if any(cat.lower() in strong_text.lower() for cat in CATEGORIES if cat != category_name):
                break  # Encontramos otra categoría, detener
        
        current = next_elem
        if len(items) > 20:  # Límite de seguridad
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

def extract_country_data(country_id, detail_id):
    """Extrae los datos de un país desde su página de detalle"""
    url = f"{BASE_URL}/pagina/detalle?id={detail_id}"
    
    print(f"\nExtrayendo datos del país ID {detail_id}...")
    print(f"URL: {url}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar el div con el contenido principal
        content_div = soup.find('div', class_='col-md-12', string=re.compile('Espectro|Competencia', re.I))
        if not content_div:
            # Buscar cualquier div con texto de categorías
            content_divs = soup.find_all('div', class_='col-md-12')
            for div in content_divs:
                text = div.get_text()
                if 'Espectro radioeléctrico' in text or 'Competencia Económica' in text:
                    content_div = div
                    break
        
        if not content_div:
            print("  ✗ No se encontró el contenido principal")
            return None
        
        # Extraer el HTML interno
        inner_html = str(content_div)
        
        practices = {}
        for category in CATEGORIES:
            category_data = extract_category_from_html(inner_html, category)
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
        country_name = "Argentina" if detail_id == 174 else "Unknown"
        if title_elem:
            text = title_elem.get_text()
            if "Argentina" in text:
                country_name = "Argentina"
            elif "Bolivia" in text:
                country_name = "Bolivia"
        
        return {
            "id": country_id,
            "name": country_name,
            "practices": practices
        }
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Función principal"""
    print("=" * 60)
    print("EXTRACTOR FINAL DE DATOS DE REGULATEL")
    print("=" * 60)
    
    all_data = []
    
    for country_id, detail_id in COUNTRY_DETAIL_IDS.items():
        data = extract_country_data(country_id, detail_id)
        if data:
            all_data.append(data)
    
    if all_data:
        output_file = "data/regulatel_real_data.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=2, ensure_ascii=False)
        print(f"\n{'=' * 60}")
        print(f"Datos extraídos y guardados en: {output_file}")
        print("=" * 60)

if __name__ == "__main__":
    main()


