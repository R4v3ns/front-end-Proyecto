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
---

## Estructura del proyecto

```
├── src/                              # Código fuente principal
│   ├── app/                          # Configuración principal de la app
│   │   ├── navigation/               # Configuración de navegación
│   │   │   └── RootNavigator.tsx     # Navegador raíz
│   │   └── providers/                # Providers de contexto (React Query, etc.)
│   ├── features/                     # Características principales de la app
│   │   ├── example/                  # Feature de ejemplo
│   │   │   ├── api/                  # Servicios HTTP
│   │   │   ├── components/           # Componentes específicos
│   │   │   ├── hooks/                # Custom hooks
│   │   │   ├── models/               # Modelos TypeScript
│   │   │   ├── screens/              # Pantallas
│   ├── services/                     # Servicios compartidos
│   │   ├── http.ts                   # Cliente HTTP base
│   │   └── env.ts                    # Configuración de entornos
│   └── shared/                       # Recursos compartidos
│       ├── components/               # Componentes reutilizables
│       ├── hooks/                    # Custom hooks globales
│       ├── theme/                    # Configuración de tema y estilos
│       └── utils/                    # Funciones auxiliares
├── environments/                     # Configuración de entornos
│   ├── environment.ts                # Configuración de desarrollo
│   └── environment.prod.ts           # Configuración de producción
├── assets/                           # Recursos estáticos
├── App.tsx                           # Componente raíz de la aplicación
├── app.json                          # Configuración de Expo
├── tsconfig.json                     # Configuración de TypeScript
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
