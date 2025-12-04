"""
Script final para actualizar countries.ts con datos reales limpios
"""
import json
import re

# Leer datos limpios
with open('data/regulatel_cleaned.json', 'r', encoding='utf-8') as f:
    cleaned_data = json.load(f)

def remove_duplicates(text):
    """Elimina duplicados de un texto"""
    if not text or "REGULATEL" in text:
        return text
    
    lines = text.split('\n')
    seen = set()
    unique_lines = []
    
    for line in lines:
        line = line.strip()
        if line and line not in seen:
            seen.add(line)
            unique_lines.append(line)
    
    return '\n'.join(unique_lines)

def create_summary(details):
    """Crea un resumen mejorado desde los detalles"""
    if not details or "REGULATEL" in details:
        return details
    
    lines = details.split('\n')
    # Tomar las primeras 3-5 líneas únicas para el resumen
    summary_lines = []
    seen = set()
    
    for line in lines[:5]:
        line = line.strip()
        if line and line not in seen and len(line) > 10:
            seen.add(line)
            summary_lines.append(line)
            if len(' '.join(summary_lines)) > 180:
                break
    
    summary = '. '.join(summary_lines)
    if len(summary) > 200:
        summary = summary[:197] + "..."
    
    return summary

# Procesar y mejorar los datos
improved_data = []
for country in cleaned_data:
    practices = {}
    for category, practice in country['practices'].items():
        details = remove_duplicates(practice['details'])
        summary = create_summary(details) if details and "REGULATEL" not in details else practice['summary']
        
        practices[category] = {
            "summary": summary,
            "details": details,
            "tags": practice['tags']
        }
    
    improved_data.append({
        "id": country['id'],
        "name": country['name'],
        "flag": country['flag'],
        "practices": practices
    })

# Guardar datos mejorados
with open('data/regulatel_final_improved.json', 'w', encoding='utf-8') as f:
    json.dump(improved_data, f, indent=2, ensure_ascii=False)

print(f"Datos mejorados de {len(improved_data)} países guardados")
print("\nResumen de datos reales:")
for country in improved_data:
    real_categories = sum(1 for p in country['practices'].values() 
                         if p['summary'] and "REGULATEL" not in p['summary'] and len(p['summary']) > 50)
    print(f"  {country['name']}: {real_categories}/8 categorías con datos reales")


