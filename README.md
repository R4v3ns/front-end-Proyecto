# Frontend - Clon Spotify DSM

Clon funcional de Spotify orientado a aprendizaje. Aplicación móvil desarrollada con React Native, Expo y TypeScript que permite registrarse, buscar y reproducir música, gestionar biblioteca (likes y playlists de usuario), explorar podcasts, y gestionar cola de reproducción. Utiliza Expo Router para la navegación y está diseñada siguiendo buenas prácticas de desarrollo móvil.

## Instalación

```bash
npm install
```

## Iniciar la aplicación

```bash
npx expo start
```

Para probar en un dispositivo físico, usa el túnel:

```bash
npx expo start --tunnel
```

Para ejecutar en plataformas específicas:

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Estructura del proyecto

```
front-end-Proyecto/
├── app/                          # Pantallas y navegación (Expo Router)
│   ├── (tabs)/                   # Navegación por pestañas
│   │   ├── index.tsx            # Inicio
│   │   ├── explore.tsx          # Explorar
│   │   ├── library.tsx          # Biblioteca
│   │   └── profile.tsx          # Perfil
│   ├── auth.tsx                 # Login y registro
│   ├── home.tsx                 # Pantalla principal
│   ├── search.tsx               # Búsqueda
│   ├── podcasts.tsx             # Lista de podcasts
│   ├── now-playing.tsx          # Reproductor de música
│   ├── profile.tsx              # Perfil de usuario
│   ├── profile-settings.tsx     # Configuración de perfil
│   ├── account-preferences.tsx  # Preferencias de cuenta
│   ├── change-password.tsx      # Cambiar contraseña
│   ├── artist/[id].tsx          # Detalles de artista
│   ├── playlist/[id].tsx        # Detalles de playlist
│   └── podcast/[id].tsx         # Detalles de podcast
├── components/                   # Componentes reutilizables
│   ├── music/                    # Componentes del reproductor
│   │   ├── MiniPlayer.tsx        # Reproductor mini
│   │   ├── PlayerControls.tsx    # Controles de reproducción
│   │   ├── ProgressBar.tsx       # Barra de progreso
│   │   ├── QueueModal.tsx        # Modal de cola
│   │   ├── ScreenHeader.tsx      # Encabezado de pantalla
│   │   └── SongCard.tsx          # Tarjeta de canción
│   └── ui/                       # Componentes UI
│       ├── button.tsx            # Botones
│       ├── input.tsx             # Inputs
│       ├── toast.tsx             # Notificaciones
│       └── collapsible.tsx       # Componentes colapsables
├── contexts/                      # Contextos de React
│   ├── AuthContext.tsx           # Manejo de autenticación
│   ├── PlayerContext.tsx         # Estado del reproductor
│   └── PreferencesContext.tsx    # Preferencias de usuario
├── services/                      # Servicios de API
│   ├── api.ts                    # Cliente HTTP base
│   ├── auth.ts                   # Servicio de autenticación
│   ├── user.ts                   # Servicio de usuario
│   ├── music.ts                  # Servicio de música
│   ├── catalog.ts                # Servicio de catálogo (CAT-01)
│   ├── search.ts                 # Servicio de búsqueda (CAT-02)
│   ├── podcasts.ts               # Servicio de podcasts (CAT-03)
│   ├── library.ts                # Servicio de biblioteca
│   └── queue.ts                  # Servicio de cola de reproducción
├── hooks/                         # Custom hooks
│   ├── useAudioPlayer.ts         # Hook del reproductor
│   ├── useSongs.ts               # Hook para canciones
│   ├── useCatalog.ts             # Hook para catálogo
│   ├── useSearch.ts              # Hook para búsqueda
│   ├── usePodcasts.ts            # Hook para podcasts
│   ├── useLibrary.ts             # Hook para biblioteca
│   ├── useQueue.ts               # Hook para cola
│   ├── useDebounce.ts            # Hook para debounce
│   ├── useTranslation.ts         # Hook para traducciones
│   └── use-color-scheme.ts       # Hook para tema
├── models/                        # Tipos TypeScript
│   ├── song.ts                   # Modelo de canción
│   ├── album.ts                  # Modelo de álbum
│   ├── artist.ts                 # Modelo de artista
│   ├── playlist.ts               # Modelo de playlist
│   ├── podcast.ts                # Modelo de podcast
│   ├── queue.ts                  # Modelo de cola
│   ├── search.ts                 # Modelo de búsqueda
│   ├── user.ts                   # Modelo de usuario
│   ├── auth.ts                   # Modelo de autenticación
│   └── preferences.ts            # Modelo de preferencias
├── config/                        # Configuración
│   └── api.ts                    # Configuración de API y endpoints
├── constants/                     # Constantes
│   └── theme.ts                  # Tema de la aplicación
├── utils/                         # Utilidades
│   ├── formatTime.ts             # Formateo de tiempo
│   ├── date.ts                   # Utilidades de fecha
│   └── youtubeImages.ts          # Utilidades de imágenes de YouTube
├── i18n/                          # Internacionalización
│   └── translations.ts            # Traducciones
└── data/                          # Datos de ejemplo
    ├── exampleSongs.ts            # Canciones de ejemplo
    ├── artists.ts                # Artistas de ejemplo
    └── podcasts.ts               # Podcasts de ejemplo
```

## Funcionalidades

### Autenticación
- Registro con email y teléfono
- Login con email y contraseña
- Verificación de email
- Recuperación de contraseña
- Cambio de contraseña
- Logout

### Catálogo (CAT-01)
- Canciones destacadas
- Canciones populares
- Canciones recientes
- Artistas populares
- Álbumes populares
- Detalles de artista
- Detalles de álbum

### Búsqueda (CAT-02)
- Búsqueda general (canciones, álbumes, artistas, podcasts, episodios)
- Búsqueda por tipo específico
- Resultados filtrados y ordenados

### Podcasts (CAT-03)
- Lista de podcasts
- Detalles de podcast
- Episodios de podcast
- Seguir/dejar de seguir podcasts
- Podcasts seguidos

### Reproductor
- Reproducir canciones
- Controles de play/pause
- Siguiente/anterior canción
- Barra de progreso
- Control de volumen
- Mini reproductor
- Pantalla completa de reproducción

### Cola de Reproducción
- Agregar canciones a la cola
- Agregar múltiples canciones
- Reordenar cola
- Eliminar canciones de la cola
- Limpiar cola completa
- Visualizar cola actual

### Biblioteca
- Ver canciones guardadas (likes)
- Dar like/quitar like a canciones
- Crear playlists
- Editar playlists
- Eliminar playlists
- Agregar/quitar canciones de playlists
- Ver detalles de playlist

### Perfil y Configuración
- Ver perfil de usuario
- Editar perfil
- Cambiar contraseña
- Configurar preferencias
- Idioma (español/inglés)
- Tema (claro/oscuro/auto)
- Notificaciones
- Privacidad

## Tecnologías

### Core
- **React Native** con **Expo** (~54.0.20)
- **TypeScript** (~5.9.2)
- **React** (19.1.0)

### Navegación
- **Expo Router** (~6.0.13) - Navegación basada en archivos
- **@react-navigation/native** (^7.1.8)
- **@react-navigation/bottom-tabs** (^7.4.0)

### Estado y Datos
- **@tanstack/react-query** (^5.90.10) - Manejo de estado del servidor
- **React Context API** - Estado global (Auth, Player, Preferences)

### Audio y Multimedia
- **expo-av** (^16.0.7) - Reproducción de audio
- **expo-image** (^3.0.10) - Optimización de imágenes
- **expo-image-picker** (^17.0.10) - Selección de imágenes

### Almacenamiento
- **expo-secure-store** (^15.0.7) - Almacenamiento seguro (tokens)

### UI/UX
- **expo-haptics** (^15.0.7) - Feedback háptico
- **react-native-gesture-handler** (~2.28.0) - Gestos
- **react-native-reanimated** (~4.1.1) - Animaciones
- **react-native-safe-area-context** (~5.6.0) - Áreas seguras

### Utilidades
- **expo-constants** (~18.0.10) - Constantes del sistema
- **expo-linking** (~8.0.8) - Deep linking
- **expo-web-browser** (^15.0.8) - Navegador web

## Configuración

### Variables de Entorno

El proyecto utiliza variables de entorno para configurar la URL del backend. Puedes configurarla de tres formas:

1. **Variable de entorno** (prioridad 1):
   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.0.21:8080
   ```

2. **app.json** (prioridad 2):
   ```json
   {
     "extra": {
       "apiUrl": "http://192.168.0.21:8080"
     }
   }
   ```

3. **Valor por defecto** (prioridad 3):
   - Web: `http://localhost:8080`
   - Móvil: `http://192.168.0.21:8080`

**Nota**: La IP `192.168.0.21` debe actualizarse según tu red local. El sistema automáticamente convierte `localhost` a la IP local en dispositivos móviles.

### Endpoints del Backend

El proyecto está configurado para trabajar con los siguientes endpoints:

- **Autenticación**: `/api/users/*`
- **Catálogo**: `/songs/*`
- **Búsqueda**: `/songs/search`
- **Podcasts**: `/api/podcasts/*` y `/songs/podcasts`
- **Biblioteca**: `/api/library/*`
- **Cola**: `/api/queue/*`

Ver `config/api.ts` para la lista completa de endpoints.

## Notas Importantes

### Expo Router
- Las rutas se definen por la estructura de carpetas en `app/`
- Los archivos `_layout.tsx` definen los layouts de navegación
- Las rutas dinámicas usan `[id].tsx`

### Autenticación
- Los tokens se guardan en **Secure Store** (móvil) o **localStorage** (web)
- El token se incluye automáticamente en todas las peticiones autenticadas

### URLs y Localhost
- El sistema corrige automáticamente URLs de `localhost` a la IP local en dispositivos móviles
- Las URLs de audio e imágenes se corrigen automáticamente en todos los servicios

### Manejo de Errores
- Los servicios manejan errores 404 retornando arrays vacíos (mejor UX)
- Los errores de API se propagan con información detallada
- Los errores de conexión se manejan de forma silenciosa cuando es apropiado

### Reproducción de Audio
- Funciona tanto en móvil como en web
- Soporta pausa, play, siguiente, anterior
- Integrado con la cola de reproducción del backend

### Internacionalización
- Soporte para español e inglés
- Traducciones en `i18n/translations.ts`
- Hook `useTranslation` para acceder a traducciones

## Scripts Disponibles

```bash
# Iniciar desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en Web
npm run web

# Linting
npm run lint

# Resetear proyecto (si es necesario)
npm run reset-project
```

## Desarrollo

### Agregar un nuevo servicio

1. Crear archivo en `services/`
2. Importar `ApiClient` y `ENDPOINTS` de `config/api.ts`
3. Usar `getAuthHeaders()` para peticiones autenticadas
4. Aplicar `fixLocalhost()` a URLs cuando sea necesario

### Agregar una nueva pantalla

1. Crear archivo en `app/` siguiendo la convención de Expo Router
2. Usar hooks personalizados para obtener datos
3. Integrar con contextos cuando sea necesario

### Agregar un nuevo hook

1. Crear archivo en `hooks/`
2. Usar React Query para peticiones al servidor
3. Exportar hook con prefijo `use`

## Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Native Documentation](https://reactnative.dev/)
