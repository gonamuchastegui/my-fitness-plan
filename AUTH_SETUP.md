# Configuración de Autenticación con Gmail

## Pasos para configurar la autenticación con Google

### 1. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google+ API" y habilítala
4. Crea credenciales OAuth 2.0:
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
   - Selecciona "Web application"
   - Agrega las siguientes URIs de redirección autorizadas:
     - `http://localhost:3000/api/auth/callback/google` (para desarrollo)
     - `https://tu-dominio.com/api/auth/callback/google` (para producción)

### 2. Configurar variables de entorno

1. Copia el archivo `env.example` a `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edita `.env.local` y configura las siguientes variables:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=tu-clave-secreta-aqui

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=tu-google-client-id
   GOOGLE_CLIENT_SECRET=tu-google-client-secret

   # Google Sheets API Configuration
   NEXT_PUBLIC_SHEETS_API_URL=https://script.google.com/macros/s/TU_SCRIPT_ID/exec
   ```

### 3. Generar NEXTAUTH_SECRET

Puedes generar una clave secreta segura usando:
```bash
openssl rand -base64 32
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Ejecutar la aplicación

```bash
npm run dev
```

## Funcionalidades implementadas

- ✅ **Autenticación obligatoria**: Todas las páginas requieren login con Gmail
- ✅ **Protección de rutas**: Middleware automático que redirige a login si no estás autenticado
- ✅ **Páginas separadas**: 
  - `/` - Página principal con planes de entrenamiento
  - `/history` - Historial de entrenamientos
  - `/best-scores` - Mejores puntuaciones personales
- ✅ **Navegación con logout**: Menú de usuario con opción de cerrar sesión
- ✅ **Datos personalizados**: Cada usuario solo ve su propio historial de entrenamientos

## Estructura de archivos creados

```
├── lib/auth.ts                           # Configuración de NextAuth
├── app/api/auth/[...nextauth]/route.ts  # Rutas de API de autenticación
├── middleware.ts                         # Middleware de protección de rutas
├── app/auth/
│   ├── signin/page.tsx                  # Página de login
│   └── error/page.tsx                   # Página de error de autenticación
├── app/history/page.tsx                 # Página de historial
├── app/best-scores/page.tsx             # Página de mejores puntuaciones
├── components/AuthNav.tsx               # Componente de navegación de usuario
├── types/next-auth.d.ts                 # Tipos de TypeScript para NextAuth
└── AUTH_SETUP.md                        # Este archivo de instrucciones
```

## Notas importantes

- La aplicación ahora requiere autenticación para acceder a cualquier funcionalidad
- Los datos de entrenamiento están asociados al usuario autenticado
- El middleware protege automáticamente todas las rutas excepto las de autenticación
- La navegación incluye información del usuario y opción de logout
