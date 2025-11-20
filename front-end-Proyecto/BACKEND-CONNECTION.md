# Solución al Error de Conexión con el Backend

## Error: `ERR_CONNECTION_REFUSED`

Este error significa que el frontend no puede conectarse al backend. Aquí están las soluciones:

## ✅ Verificación Rápida

1. **¿Está el backend corriendo?**
   - Abre una terminal en tu proyecto del backend
   - Ejecuta: `npm run dev` o `npm start`
   - Deberías ver un mensaje como: "Server running on port 8080"

2. **Verifica que el backend esté en el puerto 8080**
   - Abre tu navegador y ve a: `http://localhost:8080`
   - Deberías ver una respuesta del servidor (o un error 404, pero NO "connection refused")

## 🔧 Soluciones

### Solución 1: Verificar que el Backend esté Corriendo

```bash
# En la carpeta del backend
cd back-end-Proyecto
npm run dev
```

Deberías ver algo como:
```
Server running on http://localhost:8080
```

### Solución 2: Usar la IP de tu Máquina (Para Web)

Si estás usando Expo Web, a veces `localhost` no funciona correctamente. Usa la IP de tu máquina:

1. **Encontrar tu IP:**
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. **Actualizar la configuración:**
   
   Edita `app.json` y cambia:
   ```json
   "extra": {
     "apiUrl": "http://TU_IP_AQUI:8080"
   }
   ```
   
   Por ejemplo:
   ```json
   "extra": {
     "apiUrl": "http://192.168.1.100:8080"
   }
   ```

3. **Reinicia Expo:**
   ```bash
   # Detén Expo (Ctrl+C) y vuelve a iniciarlo
   npm start
   ```

### Solución 3: Verificar CORS en el Backend

Asegúrate de que el backend permita el origen de Expo. En tu archivo de configuración del backend:

```javascript
const cors = require('cors');

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen
    if (!origin) return callback(null, true);
    
    // Permitir localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Permitir dominios de Expo
    if (origin.includes('.exp.direct') || origin.includes('.expo.dev')) {
      return callback(null, true);
    }
    
    callback(null, true); // Para desarrollo, permitir todo
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Solución 4: Verificar el Puerto del Backend

Asegúrate de que el backend esté corriendo en el puerto 8080. Si está en otro puerto, actualiza `app.json`:

```json
"extra": {
  "apiUrl": "http://localhost:PUERTO_CORRECTO"
}
```

## 🧪 Prueba de Conexión

Puedes probar si el backend está accesible desde tu navegador:

1. Abre: `http://localhost:8080/api/users/login`
2. Deberías ver una respuesta (probablemente un error de método, pero NO "connection refused")

## 📝 Checklist

- [ ] Backend está corriendo (`npm run dev` en la carpeta del backend)
- [ ] Backend responde en `http://localhost:8080`
- [ ] CORS está configurado correctamente en el backend
- [ ] El puerto en `app.json` coincide con el puerto del backend
- [ ] Si usas Expo Web, consideras usar la IP de tu máquina en lugar de localhost

## 💡 Tips Adicionales

- **Para desarrollo móvil:** Usa la IP de tu máquina, no `localhost`
- **Para desarrollo web:** `localhost` debería funcionar si el backend está corriendo
- **Firewall:** Asegúrate de que tu firewall no esté bloqueando el puerto 8080

