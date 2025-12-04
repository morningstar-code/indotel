"""
Buscar todos los IDs desde el HTML de la página principal guardado
"""
import re

# Leer el HTML guardado
try:
    with open('argentina_page.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Buscar todos los data-url con detalle
    pattern = r'data-url="[^"]*detalle\?id=(\d+)"'
    matches = re.findall(pattern, html_content)
    
    print("IDs encontrados en la página principal:")
    print("=" * 50)
    
    unique_ids = sorted(set([int(m) for m in matches]))
    for detail_id in unique_ids:
        print(f"  ID {detail_id}")
    
    print(f"\nTotal: {len(unique_ids)} IDs únicos encontrados")
    print("\nIDs sugeridos para probar:")
    for detail_id in unique_ids:
        if detail_id not in [174, 180, 183, 184, 193, 195, 199]:
            print(f"  {detail_id}")

except FileNotFoundError:
    print("Archivo argentina_page.html no encontrado")
    print("Guardando HTML de la página principal...")
    
    import requests
    from bs4 import BeautifulSoup
    
    url = "https://regulatel.indotel.gob.do/pagina/mejores-practicas-regulatorias"
    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
    
    with open('main_page.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    
    # Buscar IDs
    pattern = r'data-url="[^"]*detalle\?id=(\d+)"'
    matches = re.findall(pattern, response.text)
    
    unique_ids = sorted(set([int(m) for m in matches]))
    print(f"\nIDs encontrados: {unique_ids}")


