"""
Script mejorado para extraer datos reales de REGULATEL
Extrae información de las páginas de detalle de cada país
"""
import requests
from bs4 import BeautifulSoup
import json
import re
import time

BASE_URL = "https://regulatel.indotel.gob.do"

# IDs de las páginas de detalle por país (estos deben ser encontrados navegando)
# Por ahora, usaremos el ID 174 que es Argentina
COUNTRY_DETAIL_IDS = {
    "argentina": 174,
    # Agregar más IDs cuando se encuentren
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
        "5g": ["5g", "quinta generación", "5 g"],
        "omv": ["omv", "operador móvil virtual"],
        "portabilidad": ["portabilidad", "portable"],
        "ciberseguridad": ["ciberseguridad", "cybersecurity", "seguridad digital"],
        "iot": ["iot", "internet de las cosas"],
        "infraestructura": ["infraestructura", "compartición"],
        "emergencia": ["emergencia", "alertas"],
        "homologación": ["homologación", "certificación"],
        "refarming": ["refarming", "reutilización"],
        "sandbox": ["sandbox", "entorno de prueba"],
        "transparencia": ["transparencia", "proceso transparente"],
        "competencia": ["competencia", "mercado competitivo"],
        "proteccion_datos": ["protección de datos", "datos personales"],
    }
    
    for tag, keywords in keyword_map.items():
        if any(keyword in text_lower for keyword in keywords):
            if tag not in tags:
                tags.append(tag)
    
    return tags

def extract_category_content(soup, category_name):
    """Extrae el contenido de una categoría específica"""
    # Buscar el heading de la categoría
    category_heading = soup.find(string=re.compile(category_name, re.I))
    
    if not category_heading:
        return None
    
    parent = category_heading.find_parent()
    if not parent:
        return None
    
    # Buscar la lista de enlaces o contenido relacionado
    content_items = []
    
    # Buscar en los siguientes elementos hermanos
    next_elem = parent.find_next_sibling()
    while next_elem and next_elem.name != 'h2' and next_elem.name != 'h3':
        # Si es una lista de enlaces
        if next_elem.name == 'ul' or (next_elem.name == 'div' and next_elem.find('a')):
            links = next_elem.find_all('a')
            for link in links:
                link_text = link.get_text(strip=True)
                if link_text:
                    content_items.append(link_text)
        # Si es un párrafo con texto
        elif next_elem.name == 'p':
            text = next_elem.get_text(strip=True)
            if text and len(text) > 20:
                content_items.append(text)
        
        next_elem = next_elem.find_next_sibling()
        if next_elem and next_elem.get('class') and 'title-element' in str(next_elem.get('class')):
            break  # Detener si encontramos otro título
    
    if content_items:
        # Crear un resumen y detalles
        all_text = " ".join(content_items)
        summary = all_text[:200] + "..." if len(all_text) > 200 else all_text
        details = "\n".join(content_items)
        
        return {
            "summary": summary,
            "details": details,
            "tags": extract_tags(all_text),
            "items": content_items
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
        
        # Extraer nombre del país y entidad
        title_elem = soup.find('div', class_='title-element')
        country_name = "Unknown"
        entity_name = ""
        
        if title_elem:
            text = title_elem.get_text(strip=True)
            # Intentar extraer nombre del país
            if "Argentina" in text:
                country_name = "Argentina"
            elif "Bolivia" in text:
                country_name = "Bolivia"
            # ... más países
        
        practices = {}
        for category in CATEGORIES:
            category_data = extract_category_content(soup, category)
            if category_data:
                practices[category] = category_data
                print(f"  ✓ {category}: {len(category_data['items'])} items encontrados")
            else:
                print(f"  ✗ {category}: No se encontró contenido")
                practices[category] = {
                    "summary": "Información no disponible en la fuente.",
                    "details": "No se pudo extraer información específica para esta categoría.",
                    "tags": []
                }
        
        return {
            "id": country_id,
            "name": country_name,
            "practices": practices
        }
        
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    """Función principal"""
    print("=" * 60)
    print("EXTRACTOR DE DATOS DE REGULATEL - PÁGINAS DE DETALLE")
    print("=" * 60)
    
    # Extraer datos de Argentina como prueba
    if "argentina" in COUNTRY_DETAIL_IDS:
        data = extract_country_data("argentina", COUNTRY_DETAIL_IDS["argentina"])
        if data:
            print(f"\nDatos extraídos para: {data['name']}")
            print(f"Categorías encontradas: {sum(1 for p in data['practices'].values() if p.get('items'))}/8")
            
            # Guardar en JSON
            with open("data/argentina_extracted.json", 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"\nDatos guardados en: data/argentina_extracted.json")

if __name__ == "__main__":
    main()


