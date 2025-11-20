# Solución al Error de CORS

## Problema
El backend está configurado para permitir solo `http://localhost:5173`, pero Expo está corriendo en `https://qv5w2-m-anonymous-8081.exp.direct`.

## Solución en el Backend

Necesitas actualizar la configuración de CORS en tu backend para permitir el origen de Expo.

### Opción 1: Permitir todos los orígenes de Expo (Recomendado para desarrollo)

En tu archivo de configuración del backend (probablemente `app.js` o `server.js`), busca la configuración de CORS y actualízala:

```javascript
const cors = require('cors');

// Permitir todos los orígenes de Expo
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Permitir localhost en cualquier puerto
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Permitir todos los dominios de Expo
    if (origin.includes('.exp.direct') || origin.includes('.expo.dev')) {
      return callback(null, true);
    }
    
    // Permitir el origen específico de desarrollo
    if (origin === 'http://localhost:5173') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Opción 2: Permitir todos los orígenes (Solo para desarrollo)

```javascript
app.use(cors({
  origin: '*', // ⚠️ Solo para desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Opción 3: Agregar el origen específico de Expo

Si prefieres ser más específico, puedes agregar el origen exacto:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://qv5w2-m-anonymous-8081.exp.direct',
  // Agrega otros orígenes de Expo que uses
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## Verificación

Después de actualizar el backend:

1. Reinicia el servidor del backend
2. Recarga la página en el navegador
3. Intenta guardar el perfil nuevamente
4. El error de CORS debería desaparecer

## Nota Importante

- La **Opción 1** es la más segura y flexible para desarrollo
- La **Opción 2** es la más simple pero menos segura
- La **Opción 3** requiere actualizar la lista cada vez que cambies de dispositivo o URL de Expo

Para producción, asegúrate de configurar solo los orígenes específicos que necesitas.

