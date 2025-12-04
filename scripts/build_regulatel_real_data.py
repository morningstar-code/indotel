"""Construye data/regulatel_real_data.json solo con datos REALES.

- Lee data/regulatel_all_countries_complete.json (salida de extract_all_final.py)
- Ignora:
  * Categorías con summary "Información no disponible en la fuente." o details "No se pudo extraer..."
  * Países que hoy sabemos que están mal mapeados (clones de Argentina): chile, ecuador, peru, uruguay
- Escribe un JSON compacto con solo la información verificada.
"""
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SRC = BASE / "data" / "regulatel_all_countries_complete.json"
DST = BASE / "data" / "regulatel_real_data.json"

# Países cuya página de detalle hoy está mal mapeada (usan el mismo ID que Argentina)
CLONED_IDS = {"chile", "ecuador", "peru", "uruguay"}

PLACEHOLDER_SUMMARY = "Información no disponible en la fuente."
PLACEHOLDER_DETAILS = "No se pudo extraer información específica para esta categoría."

def is_real_practice(p: dict) -> bool:
    """Devuelve True si la práctica NO es placeholder."""
    summary = (p.get("summary") or "").strip()
    details = (p.get("details") or "").strip()
    if not summary and not details:
        return False
    if summary == PLACEHOLDER_SUMMARY:
        return False
    if PLACEHOLDER_DETAILS in details:
        return False
    return True

def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"No existe {SRC}, ejecuta primero scripts/extract_all_final.py")

    data = json.loads(SRC.read_text(encoding="utf-8"))

    real_countries = []
    for country in data:
        cid = country.get("id")
        if not cid:
            continue

        # Saltar países clonados de Argentina (IDs mal detectados)
        if cid in CLONED_IDS:
            continue

        practices = country.get("practices", {})
        real_practices = {}
        for category, practice in practices.items():
            if is_real_practice(practice):
                # Copiamos solo summary/details/tags tal cual vienen del scraping
                real_practices[category] = {
                    "summary": practice.get("summary", ""),
                    "details": practice.get("details", ""),
                    "tags": practice.get("tags", []),
                }

        if real_practices:
            real_countries.append({
                "id": cid,
                "name": country.get("name", cid),
                "practices": real_practices,
            })

    DST.write_text(json.dumps(real_countries, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Países con datos reales: {len(real_countries)}")
    for c in real_countries:
        print(f"  {c['id']}: {len(c['practices'])} categorías reales")


if __name__ == "__main__":
    main()
