"""
Script para limpiar los datos extraídos y actualizar el archivo countries.ts
"""
import json
import re

# Leer los datos extraídos
with open('data/regulatel_all_countries_final.json', 'r', encoding='utf-8') as f:
    extracted_data = json.load(f)

# Mapeo de flags
FLAGS = {
    "argentina": "🇦🇷",
    "bolivia": "🇧🇴",
    "brasil": "🇧🇷",
    "chile": "🇨🇱",
    "colombia": "🇨🇴",
    "ecuador": "🇪🇨",
    "mexico": "🇲🇽",
    "paraguay": "🇵🇾",
    "peru": "🇵🇪",
    "rep_dominicana": "🇩🇴",
    "uruguay": "🇺🇾",
}

def clean_text(text):
    """Limpia el texto eliminando duplicados y caracteres extraños"""
    if not text or text == "Información no disponible en la fuente.":
        return text
    
    # Dividir por líneas y eliminar duplicados
    lines = text.split('\n')
    seen = set()
    unique_lines = []
    
    for line in lines:
        line = line.strip()
        if line and line not in seen and not line.startswith('- -'):
            # Limpiar formato de lista
            line = re.sub(r'^-\s*', '', line)
            if line:
                seen.add(line)
                unique_lines.append(line)
    
    return '\n'.join(unique_lines)

def clean_summary(text):
    """Limpia el resumen"""
    if not text or text == "Información no disponible en la fuente.":
        return text
    
    # Eliminar duplicados en el resumen
    words = text.split()
    seen = set()
    unique_words = []
    
    for word in words:
        if word not in seen:
            seen.add(word)
            unique_words.append(word)
        elif len(unique_words) > 0 and unique_words[-1] != word:
            # Permitir repetición si hay contexto diferente
            unique_words.append(word)
    
    cleaned = ' '.join(unique_words)
    # Limitar a 200 caracteres
    if len(cleaned) > 200:
        cleaned = cleaned[:197] + "..."
    
    return cleaned

def process_country_data(country_data):
    """Procesa y limpia los datos de un país"""
    country_id = country_data['id']
    country_name = country_data['name']
    
    practices = {}
    for category, practice_data in country_data['practices'].items():
        summary = clean_summary(practice_data.get('summary', ''))
        details = clean_text(practice_data.get('details', ''))
        tags = practice_data.get('tags', [])
        
        # Si no hay información real, usar placeholder
        if summary == "Información no disponible en la fuente." or not details or details == "No se pudo extraer información específica para esta categoría.":
            practices[category] = {
                "summary": f"Información de {category.lower()} para {country_name} disponible en la página oficial de REGULATEL.",
                "details": f"Para obtener información detallada sobre {category.lower()} en {country_name}, por favor consulta la página oficial de REGULATEL en https://regulatel.indotel.gob.do",
                "tags": []
            }
        else:
            practices[category] = {
                "summary": summary,
                "details": details,
                "tags": tags
            }
    
    return {
        "id": country_id,
        "name": country_name,
        "flag": FLAGS.get(country_id, "🏳️"),
        "practices": practices
    }

# Procesar todos los países
cleaned_data = []
for country_data in extracted_data:
    cleaned = process_country_data(country_data)
    cleaned_data.append(cleaned)

# Guardar datos limpios
with open('data/regulatel_cleaned.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

print(f"Datos limpiados de {len(cleaned_data)} países guardados en data/regulatel_cleaned.json")
print("\nResumen:")
for country in cleaned_data:
    categories_with_data = sum(1 for p in country['practices'].values() 
                               if 'REGULATEL' not in p['summary'])
    print(f"  {country['name']}: {categories_with_data}/8 categorías con datos reales")


