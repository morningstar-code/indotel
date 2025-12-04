# Instrucciones para Probar el Dashboard

## Pasos Rápidos

1. **Instalar dependencias** (ya hecho):
   ```bash
   npm install
   ```

2. **Configurar API Key de OpenAI** (opcional, solo si quieres usar las recomendaciones de IA):
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```
   OPENAI_API_KEY=tu_api_key_aqui
   ```
   
   **Nota**: Si no configuras la API key, el dashboard funcionará pero las recomendaciones de IA mostrarán un error. El resto de funcionalidades (comparación, similitudes, etc.) funcionará perfectamente.

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   
   Ve a: **http://localhost:3000**

## Cómo Usar el Dashboard

1. **Seleccionar Países**:
   - En la parte superior, verás todas las banderas de los países disponibles
   - Haz clic en una bandera para seleccionar el **País Principal (A)**
   - Haz clic en otra bandera para seleccionar el **País B** (para comparar)

2. **Seleccionar Categoría**:
   - En la columna izquierda, verás las 8 categorías regulatorias
   - Haz clic en una categoría para ver la comparación

3. **Ver Comparación**:
   - En el panel central verás:
     - Tarjeta del País A con su información
     - Tarjeta del País B con su información
     - Bloque de **Similitudes** (en verde)
     - Bloques de **Diferencias** (en azul y morado)

4. **Generar Recomendaciones de IA** (requiere API key):
   - En el panel derecho, haz clic en "Generar recomendaciones de IA"
   - La IA analizará las prácticas de ambos países y sugerirá mejoras

## Datos Disponibles

### Países con Datos Reales Completos:
- ✅ **Argentina**: 8/8 categorías con datos reales de ENACOM

### Países con Datos Reales Parciales:
- ⚠️ **Bolivia**: 2/8 categorías (Espectro radioeléctrico, Homologación)
- ⚠️ **Brasil**: 1/8 categorías (Telecomunicaciones de emergencia)

### Países con Datos de Ejemplo:
- Los demás países (Chile, Colombia, Ecuador, México, Paraguay, Perú, República Dominicana, Uruguay) tienen datos de ejemplo hasta que se extraigan los datos reales completos.

## Solución de Problemas

### El servidor no inicia:
- Asegúrate de que el puerto 3000 no esté en uso
- Verifica que Node.js esté instalado: `node --version`

### Error con OpenAI:
- Si no configuraste la API key, es normal que las recomendaciones de IA no funcionen
- El resto del dashboard funciona sin la API key

### No se ven los datos:
- Verifica que el archivo `data/countries.ts` exista
- Asegúrate de que el servidor esté ejecutándose correctamente


