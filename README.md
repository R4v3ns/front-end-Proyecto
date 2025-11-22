# Frontend - Clon Spotify DSM

Clon funcional de Spotify orientado a aprendizaje. Aplicación móvil desarrollada con React Native, Expo y TypeScript que permite registrarse, buscar y reproducir música, gestionar biblioteca (likes y playlists de usuario), y explorar podcasts. Utiliza Expo Router para la navegación y está diseñada siguiendo buenas prácticas de desarrollo móvil.

## Setup

---

## Instalación

```bash
npm install
```

---

## Iniciar la aplicación

```bash
npx expo start
```

Para probar en un dispositivo físico, usa el túnel:

```bash
npx expo start --tunnel
```
---

## Estructura del proyecto

```
front-end-Proyecto/
├── app/                    # Pantallas y navegación (Expo Router)
│   ├── auth.tsx           # Login y registro
│   ├── home.tsx           # Pantalla principal
│   ├── profile.tsx        # Perfil de usuario
│   ├── now-playing.tsx    # Reproductor de música
│   └── account-preferences.tsx  # Configuración de cuenta
├── components/            # Componentes reutilizables
│   ├── music/             # Componentes del reproductor
│   └── ui/                # Botones, inputs, etc.
├── contexts/              # Contextos de React
│   ├── AuthContext.tsx    # Manejo de autenticación
│   └── PreferencesContext.tsx  # Preferencias de usuario
├── services/              # Servicios de API
│   ├── api.ts             # Cliente HTTP base
│   ├── auth.ts            # Servicio de autenticación
│   ├── user.ts            # Servicio de usuario
│   └── music.ts           # Servicio de música
├── hooks/                 # Custom hooks
│   ├── useAudioPlayer.ts  # Hook del reproductor
│   └── useSongs.ts        # Hook para canciones
├── models/                # Tipos TypeScript
├── config/                # Configuración (API, etc.)
└── utils/                 # Utilidades
```

## Funcionalidades

- **Autenticación**: Registro, login, recuperación de contraseña
- **Reproductor**: Reproducir canciones, controles de play/pause, siguiente/anterior
- **Biblioteca**: Ver canciones, dar like, crear playlists
- **Perfil**: Editar perfil, cambiar contraseña, configurar preferencias
- **Preferencias**: Idioma, tema (claro/oscuro/auto), notificaciones, privacidad

## Dependencias principales

### Navegación y UI
```bash
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler
```

## Tecnologías

- React Native con Expo
- TypeScript
- Expo Router para navegación
- React Query para manejo de datos
- Expo AV para reproducción de audio
- Expo Secure Store para almacenamiento seguro

## Notas

- El proyecto usa Expo Router, así que las rutas se definen por la estructura de carpetas en `app/`
- Los tokens de autenticación se guardan en Secure Store (móvil) o localStorage (web)
- Las preferencias de usuario se persisten localmente
- El reproductor funciona tanto en móvil como en web
