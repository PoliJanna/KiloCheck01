# KiloCheck

Una aplicación web progresiva que utiliza inteligencia artificial para analizar fotografías de etiquetas de productos en supermercados y calcular automáticamente el precio unitario (€/kg o €/L).

## Características

- 🤖 **Análisis con IA**: Utiliza Gemini 1.5 Flash para extraer datos de imágenes
- 📱 **Responsive**: Optimizado para móvil y desktop
- 🎨 **Diseño Premium**: Interfaz minimalista con animaciones fluidas
- ⚡ **Rápido**: Construido con Next.js 14 y optimizaciones modernas
- 🔒 **Seguro**: Procesamiento de imágenes sin almacenamiento permanente

## Tecnologías

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Animaciones**: Framer Motion
- **IA**: Google Gemini 1.5 Flash API
- **Testing**: Jest, React Testing Library, fast-check
- **Deployment**: Vercel

## Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd kilo-check
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
# Edita .env.local con tu API key de Gemini
```

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Variables de Entorno

```bash
GEMINI_API_KEY=tu_api_key_de_gemini
NEXT_PUBLIC_APP_NAME=KiloCheck
NEXT_PUBLIC_APP_VERSION=0.1.0
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linting con ESLint
- `npm run test` - Ejecutar tests
- `npm run test:watch` - Tests en modo watch
- `npm run validate:security` - Validación de seguridad
- `npm run validate:production` - Validación para producción

## Deployment

### Vercel (Recomendado)

1. **Configuración rápida**:
```bash
npm install -g vercel
vercel login
vercel --prod
```

2. **Configuración manual**:
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Importa tu repositorio Git
   - Configura las variables de entorno
   - Deploy

3. **Variables de entorno requeridas en Vercel**:
   - `GEMINI_API_KEY`: Tu API key de Google Gemini
   - `NEXT_PUBLIC_APP_NAME`: KiloCheck
   - `NEXT_PUBLIC_APP_VERSION`: 0.1.0

Para más detalles, consulta [DEPLOYMENT.md](./DEPLOYMENT.md)

### Otros Proveedores

La aplicación también es compatible con:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

Consulta la documentación específica de cada proveedor para la configuración.

## Estructura del Proyecto

```
src/
├── app/                 # App Router de Next.js
│   ├── api/            # API routes
│   ├── globals.css     # Estilos globales
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página principal
├── components/         # Componentes React
├── lib/               # Utilidades y configuración
└── types/             # Definiciones de TypeScript
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.