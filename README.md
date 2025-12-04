# Observatorio de Mejores Prácticas Regulatorias - REGULATEL

Aplicación web para comparar mejores prácticas regulatorias de telecomunicaciones entre países miembros de REGULATEL.

## Características

- Comparación de prácticas regulatorias entre países
- 8 categorías regulatorias
- Análisis de similitudes y diferencias
- Recomendaciones de IA usando OpenAI
- Interfaz moderna y responsive

## Tecnologías

- Next.js 14
- TypeScript
- TailwindCSS
- OpenAI API

## Instalación

1. Instala las dependencias:

```bash
npm install
```

2. Configura la variable de entorno para OpenAI:

Crea un archivo `.env.local` en la raíz del proyecto:

```
OPENAI_API_KEY=tu_api_key_aqui
```

3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

- `app/` - Páginas y rutas de Next.js
- `components/` - Componentes React reutilizables
- `data/` - Datos de países y categorías
- `lib/` - Utilidades y funciones auxiliares
- `app/api/` - Rutas de API para recomendaciones de IA

## Uso

1. Selecciona un país principal (País A)
2. Selecciona un país para comparar (País B)
3. Elige una categoría regulatoria
4. Revisa las similitudes y diferencias
5. Genera recomendaciones de IA para mejoras


