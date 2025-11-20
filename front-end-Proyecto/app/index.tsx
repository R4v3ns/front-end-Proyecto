import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Redirigir automáticamente a la página principal
  return <Redirect href="/home" />;
}
