"""
Script para extraer datos reales de REGULATEL
Extrae información de las 8 categorías regulatorias para cada país
"""
import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin
import time

BASE_URL = "https://regulatel.indotel.gob.do"

# Mapeo de países y sus URLs
COUNTRIES = {
    "argentina": {"name": "Argentina", "flag": "🇦🇷", "url": "argentina"},
    "bolivia": {"name": "Bolivia", "flag": "🇧🇴", "url": "bolivia"},
    "brasil": {"name": "Brasil", "flag": "🇧🇷", "url": "brasil"},
    "chile": {"name": "Chile", "flag": "🇨🇱", "url": "chile"},
    "colombia": {"name": "Colombia", "flag": "🇨🇴", "url": "colombia"},
    "ecuador": {"name": "Ecuador", "flag": "🇪🇨", "url": "ecuador"},
    "mexico": {"name": "México", "flag": "🇲🇽", "url": "mexico"},
    "paraguay": {"name": "Paraguay", "flag": "🇵🇾", "url": "paraguay"},
    "peru": {"name": "Perú", "flag": "🇵🇪", "url": "peru"},
    "rep_dominicana": {"name": "República Dominicana", "flag": "🇩🇴", "url": "rep-dominicana"},
    "uruguay": {"name": "Uruguay", "flag": "🇺🇾", "url": "uruguay"},
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
    """Extrae tags relevantes del texto basándose en palabras clave"""
    tags = []
    text_lower = text.lower()
    
    keyword_map = {
        "subastas": ["subasta", "licitación", "asignación competitiva"],
        "5g": ["5g", "quinta generación", "5 g"],
        "omv": ["omv", "operador móvil virtual", "operadores móviles virtuales"],
        "portabilidad": ["portabilidad", "portable", "portación"],
        "ciberseguridad": ["ciberseguridad", "cybersecurity", "seguridad digital", "cibernético"],
        "iot": ["iot", "internet de las cosas", "internet of things"],
        "infraestructura": ["infraestructura", "compartición", "compartir infraestructura"],
        "emergencia": ["emergencia", "alertas", "sistema de alerta"],
        "homologación": ["homologación", "certificación", "aprobación de equipos"],
        "refarming": ["refarming", "refarming de espectro", "reutilización"],
        "sandbox": ["sandbox", "entorno de prueba", "regulador experimental"],
        "transparencia": ["transparencia", "proceso transparente", "licitación pública"],
        "competencia": ["competencia", "mercado competitivo", "promoción de competencia"],
        "proteccion_datos": ["protección de datos", "datos personales", "privacidad"],
    }
    
    for tag, keywords in keyword_map.items():
        if any(keyword in text_lower for keyword in keywords):
            if tag not in tags:
                tags.append(tag)
    
    return tags

def extract_country_data(country_id, country_info):
    """Extrae los datos de un país específico"""
    url = f"{BASE_URL}/pagina/mejores-practicas-regulatorias/{country_info['url']}"
    
    print(f"\nExtrayendo datos de {country_info['name']}...")
    print(f"URL: {url}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar el contenido principal
        practices = {}
        
        # Buscar cada categoría en el contenido
        for category in CATEGORIES:
            # Buscar el texto de la categoría (puede estar en diferentes formatos)
            category_elem = soup.find(string=re.compile(category, re.I))
            
            if category_elem:
                # Buscar el contenido relacionado
                parent = category_elem.find_parent()
                content_text = ""
                
                # Intentar encontrar el siguiente párrafo o div con contenido
                if parent:
                    # Buscar en los siguientes elementos
                    next_elements = parent.find_next_siblings()
                    for elem in next_elements[:3]:  # Revisar los siguientes 3 elementos
                        text = elem.get_text(strip=True)
                        if text and len(text) > 50:  # Si tiene contenido sustancial
                            content_text = text
                            break
                    
                    # Si no encontramos en siblings, buscar en el mismo elemento
                    if not content_text:
                        full_text = parent.get_text(strip=True)
                        # Extraer solo la parte después del título de la categoría
                        parts = full_text.split(category, 1)
                        if len(parts) > 1:
                            content_text = parts[1].strip()
                
                # Si aún no tenemos contenido, buscar en toda la página
                if not content_text:
                    # Buscar divs o secciones que puedan contener el contenido
                    all_text = soup.get_text()
                    # Buscar el patrón: categoría seguida de texto
                    pattern = re.compile(f"{re.escape(category)}[\\s\\S]{{0,500}}", re.I)
                    match = pattern.search(all_text)
                    if match:
                        content_text = match.group(0).replace(category, "").strip()
                
                if content_text and len(content_text) > 20:
                    # Limpiar el texto
                    content_text = re.sub(r'\s+', ' ', content_text)
                    summary = content_text[:200] + "..." if len(content_text) > 200 else content_text
                    
                    practices[category] = {
                        "summary": summary,
                        "details": content_text,
                        "tags": extract_tags(content_text)
                    }
                    print(f"  ✓ {category}: {len(content_text)} caracteres")
                else:
                    print(f"  ✗ {category}: No se encontró contenido")
                    practices[category] = {
                        "summary": "Información no disponible en la fuente.",
                        "details": "No se pudo extraer información específica para esta categoría desde la página web de REGULATEL.",
                        "tags": []
                    }
            else:
                print(f"  ✗ {category}: No se encontró en la página")
                practices[category] = {
                    "summary": "Información no disponible en la fuente.",
                    "details": "No se pudo extraer información específica para esta categoría desde la página web de REGULATEL.",
                    "tags": []
                }
        
        return {
            "id": country_id,
            "name": country_info["name"],
            "flag": country_info["flag"],
            "practices": practices
        }
        
    except Exception as e:
        print(f"Error extrayendo datos de {country_info['name']}: {e}")
        return None

def main():
    """Función principal"""
    print("=" * 60)
    print("EXTRACTOR DE DATOS DE REGULATEL")
    print("=" * 60)
    
    all_countries_data = []
    
    for country_id, country_info in COUNTRIES.items():
        data = extract_country_data(country_id, country_info)
        if data:
            all_countries_data.append(data)
        time.sleep(2)  # Esperar entre requests para no sobrecargar el servidor
    
    # Guardar los datos en un archivo JSON
    output_file = "data/regulatel_extracted_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_countries_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 60}")
    print(f"Datos extraídos de {len(all_countries_data)} países")
    print(f"Archivo guardado en: {output_file}")
    print("=" * 60)
    
    # Mostrar resumen
    for country_data in all_countries_data:
        categories_found = sum(1 for p in country_data["practices"].values() 
                              if p["details"] != "No se pudo extraer información específica")
        print(f"{country_data['name']}: {categories_found}/8 categorías encontradas")

if __name__ == "__main__":
    main()


