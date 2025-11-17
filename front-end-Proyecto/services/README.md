# Servicio de API

Este servicio proporciona una interfaz para conectarse con el backend del proyecto.

## Configuración

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Importante para desarrollo móvil:**
- En lugar de `localhost`, usa la IP de tu computadora (ej: `http://192.168.1.100:3000`)
- Para encontrar tu IP:
  - Mac/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
  - Windows: `ipconfig`

### Alternativa: Configuración en app.json

También puedes configurar la URL del backend directamente en `app.json` en la sección `extra.apiUrl`.

## Uso

### Ejemplo básico

```typescript
import ApiClient from '@/services/api';

// GET request
const response = await ApiClient.get('/users');
console.log(response.data);

// GET con parámetros
const users = await ApiClient.get('/users', {
  params: { page: 1, limit: 10 }
});

// POST request
const newUser = await ApiClient.post('/users', {
  name: 'Juan',
  email: 'juan@example.com'
});

// PUT request
const updated = await ApiClient.put('/users/1', {
  name: 'Juan Actualizado'
});

// PATCH request
const patched = await ApiClient.patch('/users/1', {
  email: 'nuevo@example.com'
});

// DELETE request
await ApiClient.delete('/users/1');
```

### Manejo de errores

```typescript
import ApiClient, { ApiError } from '@/services/api';

try {
  const response = await ApiClient.get('/users');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Error de API:', error.message);
    console.error('Status:', error.status);
    console.error('Data:', error.data);
  } else {
    console.error('Error desconocido:', error);
  }
}
```

### Agregar autenticación

Para agregar tokens de autenticación, edita el archivo `services/api.ts` y modifica la función `getHeaders` para incluir el token almacenado (por ejemplo, usando `AsyncStorage` o `SecureStore`).

