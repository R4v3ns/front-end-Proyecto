# Frontend - Clon Spotify DSM

Clon funcional de Spotify orientado a aprendizaje. Aplicación móvil desarrollada con React Native, Expo y TypeScript que permite registrarse, buscar y reproducir música, gestionar biblioteca (likes y playlists de usuario), y explorar podcasts. Utiliza Expo Router para la navegación y está diseñada siguiendo buenas prácticas de desarrollo móvil.

---

## Instalación

```bash
npm install
```

---

## Iniciar la aplicación

```bash
# Inicia el servidor de desarrollo de Expo
npx expo start

# Habilita entradas para dispositivos físicos
npx expo start --tunnel
```

También puedes usar los scripts de npm:

```bash
npm start          # Inicia el servidor de desarrollo
npm run android    # Ejecuta en Android
npm run ios        # Ejecuta en iOS
npm run web        # Ejecuta en web
```
---

## Estructura del proyecto

```
├── app/                              # Pantallas y navegación (Expo Router)
│   ├── (tabs)/                       # Navegación por tabs
│   │   ├── _layout.tsx              # Layout de tabs
│   │   ├── index.tsx                # Tab principal
│   │   └── explore.tsx              # Tab de exploración
│   ├── providers/                    # Providers de contexto
│   │   └── QueryProvider.tsx        # Provider de React Query
│   ├── _layout.tsx                   # Layout raíz de la app
│   ├── auth.tsx                      # Pantalla de autenticación
│   ├── change-password.tsx           # Cambio de contraseña
│   ├── home.tsx                      # Pantalla principal
│   ├── index.tsx                     # Pantalla inicial
│   ├── modal.tsx                     # Modal de ejemplo
│   ├── now-playing.tsx               # Reproductor de música
│   ├── profile.tsx                   # Perfil de usuario
│   └── profile-settings.tsx          # Configuración de perfil
├── components/                       # Componentes reutilizables
│   ├── music/                        # Componentes del reproductor
│   │   ├── PlayerControls.tsx        # Controles del reproductor
│   │   ├── ProgressBar.tsx           # Barra de progreso
│   │   ├── ScreenHeader.tsx          # Header de pantalla
│   │   ├── SongCard.tsx              # Tarjeta de canción
│   │   └── index.ts                  # Exportaciones
│   ├── ui/                           # Componentes de UI base
│   │   ├── button.tsx                # Botón
│   │   ├── collapsible.tsx           # Componente colapsable
│   │   ├── icon-symbol.tsx           # Iconos
│   │   └── input.tsx                 # Input
│   ├── external-link.tsx             # Enlace externo
│   ├── haptic-tab.tsx                # Tab con haptic feedback
│   ├── hello-wave.tsx                # Componente de ejemplo
│   ├── parallax-scroll-view.tsx      # Vista con scroll parallax
│   ├── themed-text.tsx               # Texto con tema
│   └── themed-view.tsx               # Vista con tema
├── config/                           # Configuración
│   └── api.ts                        # Configuración de la API
├── constants/                         # Constantes
│   └── theme.ts                      # Configuración de tema
├── contexts/                         # Contextos de React
│   └── AuthContext.tsx               # Contexto de autenticación
├── hooks/                            # Custom hooks
│   ├── useAudioPlayer.ts             # Hook para reproductor de audio
│   ├── useSongs.ts                   # Hook para gestión de canciones
│   ├── use-color-scheme.ts           # Hook para esquema de colores
│   └── use-theme-color.ts            # Hook para colores del tema
├── models/                           # Modelos TypeScript
│   ├── auth.ts                       # Modelos de autenticación
│   ├── song.ts                       # Modelos de canciones
│   └── user.ts                       # Modelos de usuario
├── services/                         # Servicios para llamadas a la API
│   ├── api.ts                        # Cliente HTTP base
│   ├── auth.ts                       # Servicios de autenticación
│   ├── music.ts                      # Servicios de música
│   ├── user.ts                       # Servicios de usuario
│   ├── ejemplo-uso.ts                # Ejemplos de uso
│   └── README.md                     # Documentación de servicios
├── scripts/                          # Scripts de utilidad
│   └── reset-project.js              # Script para resetear proyecto
├── utils/                            # Funciones auxiliares
│   ├── date.ts                       # Utilidades de fecha
│   └── formatTime.ts                 # Formateo de tiempo
├── assets/                           # Recursos estáticos
│   └── images/                       # Imágenes
├── app.json                          # Configuración de Expo
├── tsconfig.json                     # Configuración de TypeScript
├── eslint.config.js                  # Configuración de ESLint
└── package.json                      # Dependencias y scripts
```

---

## Dependencias principales

### Navegación y UI
```bash
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler
```

### Estado y datos
```bash
npm install @tanstack/react-query
```

### Audio y Media
```bash
npm install expo-av
```

### Expo y React Native
```bash
npm install expo react react-native expo-status-bar
npm install expo-constants
```

### Desarrollo y TypeScript
```bash
npm install --save-dev typescript @types/react @types/react-native
npm install --save-dev @babel/core
```

## Configuración de la API

La URL del backend se configura en `app.json` en la sección `extra.apiUrl`. Para desarrollo móvil, usa la IP de tu computadora en lugar de `localhost`. Ver más detalles en `services/README.md`.
