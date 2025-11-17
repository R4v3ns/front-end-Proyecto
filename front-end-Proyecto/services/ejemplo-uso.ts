/**
 * EJEMPLO DE USO DEL CLIENTE API
 * 
 * Este archivo muestra ejemplos de cómo usar el ApiClient
 * Puedes eliminar este archivo cuando ya tengas claro cómo usarlo
 */

import ApiClient, { ApiError } from './api';

// ============================================
// EJEMPLO 1: GET Request
// ============================================
export const ejemploGet = async () => {
  try {
    // GET simple
    const { data } = await ApiClient.get('/users');
    console.log('Usuarios:', data);

    // GET con parámetros de query
    const { data: usuariosFiltrados } = await ApiClient.get('/users', {
      params: {
        page: 1,
        limit: 10,
        status: 'active',
      },
    });
    console.log('Usuarios filtrados:', usuariosFiltrados);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Error en GET:', error.message, error.status);
    }
  }
};

// ============================================
// EJEMPLO 2: POST Request
// ============================================
export const ejemploPost = async () => {
  try {
    const nuevoUsuario = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
    };

    const { data } = await ApiClient.post('/users', nuevoUsuario);
    console.log('Usuario creado:', data);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Error en POST:', error.message, error.status);
      console.error('Datos del error:', error.data);
    }
  }
};

// ============================================
// EJEMPLO 3: PUT Request
// ============================================
export const ejemploPut = async (userId: string) => {
  try {
    const datosActualizados = {
      name: 'Juan Pérez Actualizado',
      email: 'juan.nuevo@example.com',
    };

    const { data } = await ApiClient.put(`/users/${userId}`, datosActualizados);
    console.log('Usuario actualizado:', data);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Error en PUT:', error.message, error.status);
    }
  }
};

// ============================================
// EJEMPLO 4: PATCH Request
// ============================================
export const ejemploPatch = async (userId: string) => {
  try {
    // PATCH para actualizar solo algunos campos
    const { data } = await ApiClient.patch(`/users/${userId}`, {
      email: 'nuevo.email@example.com',
    });
    console.log('Usuario parcialmente actualizado:', data);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Error en PATCH:', error.message, error.status);
    }
  }
};

// ============================================
// EJEMPLO 5: DELETE Request
// ============================================
export const ejemploDelete = async (userId: string) => {
  try {
    await ApiClient.delete(`/users/${userId}`);
    console.log('Usuario eliminado correctamente');
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Error en DELETE:', error.message, error.status);
    }
  }
};

// ============================================
// EJEMPLO 6: Uso en un componente React
// ============================================
/*
import { useState, useEffect } from 'react';
import ApiClient, { ApiError } from '@/services/api';

export default function MiComponente() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setLoading(true);
        const { data } = await ApiClient.get('/users');
        setUsuarios(data);
        setError(null);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Error ${err.status}: ${err.message}`);
        } else {
          setError('Error desconocido');
        }
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, []);

  if (loading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      {usuarios.map((usuario) => (
        <Text key={usuario.id}>{usuario.name}</Text>
      ))}
    </View>
  );
}
*/

