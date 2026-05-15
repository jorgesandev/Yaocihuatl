# Chimalli Chat

Interfaz conversacional MVP para orientación legal asistida. Es empática, clara y explícita sobre sus límites: no sustituye asesoría jurídica ni decisión de autoridad.

## Ejecutar

```bash
cd frontend/apps/chimalli-chat
npm install
npm run dev
```

Configurar backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Seguridad y Demo

- No usar datos reales.
- No pega evidencia sensible en la narrativa demo.
- La salida rápida limpia estado visible local de la pantalla.
- Todo resultado de IA se muestra como sugerencia pendiente de revisión humana.
