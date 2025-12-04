"""
Script para extraer datos de mejores prácticas regulatorias de REGULATEL
"""
import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin, urlparse

BASE_URL = "https://regulatel.indotel.gob.do"

def get_country_links():
    """Obtiene los enlaces a todas las páginas de países"""
    url = f"{BASE_URL}/pagina/mejores-practicas-regulatorias"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    country_links = []
    # Buscar todos los enlaces que puedan ser países
    for link in soup.find_all('a', href=True):
        href = link.get('href')
        if href and ('pais' in href.lower() or 'country' in href.lower() or 'argentina' in href.lower() or 'bolivia' in href.lower()):
            full_url = urljoin(BASE_URL, href)
            country_links.append(full_url)
    
    # También buscar por texto de países
    country_names = ['Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 
                     'Ecuador', 'Paraguay', 'Perú', 'Uruguay', 'Venezuela',
                     'República Dominicana', 'México', 'Panamá', 'Costa Rica']
    
    for country in country_names:
        links = soup.find_all('a', string=re.compile(country, re.I))
        for link in links:
            href = link.get('href')
            if href:
                full_url = urljoin(BASE_URL, href)
                if full_url not in country_links:
                    country_links.append(full_url)
    
    return list(set(country_links))

def extract_country_data(country_url):
    """Extrae los datos de un país específico"""
    try:
        response = requests.get(country_url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extraer nombre del país
        country_name = soup.find('h1') or soup.find('h2')
        if country_name:
            country_name = country_name.get_text(strip=True)
        else:
            country_name = "Unknown"
        
        # Buscar las 8 categorías
        categories = [
            "Espectro radioeléctrico",
            "Competencia Económica",
            "Ciberseguridad",
            "Protección del usuario",
            "Tecnologías emergentes",
            "Compartición de la infraestructura",
            "Telecomunicaciones de emergencia",
            "Homologación de productos y dispositivos"
        ]
        
        practices = {}
        for category in categories:
            # Buscar el texto de la categoría
            category_elem = soup.find(string=re.compile(category, re.I))
            if category_elem:
                # Buscar el contenido siguiente
                parent = category_elem.find_parent()
                if parent:
                    # Buscar el siguiente elemento con contenido
                    next_elem = parent.find_next_sibling()
                    if next_elem:
                        text = next_elem.get_text(strip=True)
                        practices[category] = {
                            "summary": text[:200] + "..." if len(text) > 200 else text,
                            "details": text,
                            "tags": extract_tags(text)
                        }
        
        return {
            "name": country_name,
            "url": country_url,
            "practices": practices
        }
    except Exception as e:
        print(f"Error extrayendo datos de {country_url}: {e}")
        return None

def extract_tags(text):
    """Extrae tags relevantes del texto"""
    tags = []
    keywords = {
        "subastas": ["subasta", "licitación", "asignación"],
        "5g": ["5g", "quinta generación"],
        "omv": ["omv", "operador móvil virtual"],
        "portabilidad": ["portabilidad", "portable"],
        "ciberseguridad": ["ciberseguridad", "cybersecurity", "seguridad digital"],
        "iot": ["iot", "internet de las cosas"],
        "infraestructura": ["infraestructura", "compartición"],
        "emergencia": ["emergencia", "alertas"],
        "homologación": ["homologación", "certificación"]
    }
    
    text_lower = text.lower()
    for tag, keywords_list in keywords.items():
        if any(keyword in text_lower for keyword in keywords_list):
            tags.append(tag)
    
    return tags

if __name__ == "__main__":
    print("Extrayendo enlaces de países...")
    country_links = get_country_links()
    print(f"Encontrados {len(country_links)} enlaces")
    
    all_data = []
    for link in country_links[:5]:  # Limitar a 5 para prueba
        print(f"Extrayendo datos de {link}...")
        data = extract_country_data(link)
        if data:
            all_data.append(data)
    
    print(json.dumps(all_data, indent=2, ensure_ascii=False))



