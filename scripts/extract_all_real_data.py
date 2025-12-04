import requests
import json
import time

# Mapeo de IDs
COUNTRY_IDS = {
    "argentina": 174,
    "bolivia": 180,
    "brasil": 183,
    "colombia": 184,
    "mexico": 193,
    "paraguay": 195,
    "rep_dominicana": 199
}

# Mapeo de nombres
COUNTRY_NAMES = {
    "argentina": "Argentina",
    "bolivia": "Bolivia",
    "brasil": "Brasil",
    "colombia": "Colombia",
    "mexico": "México",
    "paraguay": "Paraguay",
    "rep_dominicana": "República Dominicana"
}

def fetch_country_data(country_id):
    """Obtiene los datos de un país desde la API"""
    url = f"https://regulatel.indotel.gob.do/pais/{country_id}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching data for country ID {country_id}: {e}")
        return None

def process_country_data(country_key, country_id):
    """Procesa los datos de un país"""
    print(f"\nExtrayendo datos de {COUNTRY_NAMES[country_key]}...")
    
    data = fetch_country_data(country_id)
    
    if not data:
        return None
    
    # Estructura base
    country_data = {
        "id": country_key,
        "name": COUNTRY_NAMES[country_key],
        "practices": {}
    }
    
    # Procesar categorías
    if "categorias" in data:
        for categoria in data["categorias"]:
            cat_name = categoria.get("nombre", "")
            
            # Obtener detalles y resumen
            details = []
            if "subcategorias" in categoria:
                for subcat in categoria["subcategorias"]:
                    subcat_name = subcat.get("nombre", "")
                    if subcat_name:
                        details.append(f"- {subcat_name}")
            
            # Crear resumen (primeros 200 caracteres de los detalles)
            summary = " ".join(details).replace("- ", "")[:200]
            if len(summary) == 200:
                summary += "..."
            
            # Extraer tags básicos
            tags = []
            lower_name = cat_name.lower()
            if "espectro" in lower_name:
                tags.append("espectro")
            if "competencia" in lower_name:
                tags.append("competencia")
            if "ciberseguridad" in lower_name:
                tags.append("ciberseguridad")
            if "usuario" in lower_name or "consumidor" in lower_name:
                tags.append("protección_usuarios")
            if "5g" in lower_name:
                tags.append("5g")
            if "emergencia" in lower_name:
                tags.append("emergencia")
            if "infraestructura" in lower_name:
                tags.append("infraestructura")
            if "portabilidad" in lower_name:
                tags.append("portabilidad")
            if "homologación" in lower_name or "homologacion" in lower_name:
                tags.append("homologación")
            
            if cat_name and (details or summary):
                country_data["practices"][cat_name] = {
                    "summary": summary,
                    "details": "\n".join(details),
                    "tags": tags
                }
    
    return country_data

def main():
    all_data = []
    
    for country_key, country_id in COUNTRY_IDS.items():
        country_data = process_country_data(country_key, country_id)
        
        if country_data:
            all_data.append(country_data)
            print(f"✓ {COUNTRY_NAMES[country_key]}: {len(country_data['practices'])} prácticas extraídas")
        else:
            print(f"✗ {COUNTRY_NAMES[country_key]}: Error al extraer datos")
        
        # Pausa para no saturar el servidor
        time.sleep(1)
    
    # Guardar datos
    output_file = "data/regulatel_real_data.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Datos guardados en {output_file}")
    print(f"Total de países: {len(all_data)}")

if __name__ == "__main__":
    main()
