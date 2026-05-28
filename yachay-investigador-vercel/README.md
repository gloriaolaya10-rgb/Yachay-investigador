# Yachay Investigador — MVP para Vercel

Aplicación web para orientar a estudiantes de Seminario de Investigación I en la selección de enfoque, tipo, nivel y diseño de investigación.

## Funciones incluidas
- Flujo paso a paso.
- Imagen de Yachay integrada.
- Diagnóstico preliminar de enfoque/diseño.
- Asesoría metodológica con OpenAI.
- Consulta rápida a la IA.
- Descarga de reporte en PDF mediante impresión del navegador.
- Exportación JSON del caso.
- Envío anónimo opcional a reporte docente mediante webhook.

## Variables de entorno en Vercel
OPENAI_API_KEY=tu_api_key
OPENAI_MODEL=gpt-4.1-mini
REPORT_WEBHOOK_URL=opcional_url_de_google_apps_script_o_webhook

Si no configuras OPENAI_API_KEY, la app funciona con respuestas base, pero sin IA robusta.
Si no configuras REPORT_WEBHOOK_URL, los casos no se enviarán a reporte docente.

## Deploy rápido
1. Sube esta carpeta a un repositorio de GitHub.
2. Entra a Vercel.
3. New Project.
4. Importa el repositorio.
5. Añade variables de entorno.
6. Deploy.
