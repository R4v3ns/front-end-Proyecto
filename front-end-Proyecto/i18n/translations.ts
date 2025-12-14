export type Language = 'es' | 'en';

export const translations = {
  es: {
    accountPreferences: {
      title: 'Preferencias de cuenta',
      language: 'Idioma',
      languageDescription: 'Elige el idioma en el que quieres usar la aplicación',
      appearance: 'Apariencia',
      appearanceDescription: 'Personaliza cómo se ve la aplicación',
      theme: 'Tema',
      content: 'Contenido',
      contentDescription: 'Controla qué tipo de contenido puedes ver',
      allowExplicit: 'Permitir contenido explícito',
      allowExplicitDescription: 'Puedes ver y reproducir contenido marcado como explícito',
      notifications: 'Notificaciones',
      notificationsDescription: 'Elige qué notificaciones quieres recibir',
      newReleases: 'Nuevos lanzamientos',
      newReleasesDescription: 'Recibe notificaciones cuando tus artistas favoritos publiquen nueva música',
    },
    theme: {
      light: 'Claro',
      dark: 'Oscuro',
      auto: 'Automático',
      lightDescription: 'Tema claro siempre activo',
      darkDescription: 'Tema oscuro siempre activo',
      autoDescription: 'Sigue la configuración del sistema',
    },
    language: {
      spanish: 'Español',
      english: 'English',
    },
    common: {
      cancel: 'Cancelar',
      save: 'Guardar',
      back: 'Volver',
    },
    nav: {
      home: 'Inicio',
      library: 'Biblioteca',
      profile: 'Perfil',
      explore: 'Explorar',
    },
    home: {
      greeting: 'Hola',
      featured: 'Canciones destacadas',
      popular: 'Popular',
      podcasts: 'Podcasts',
      artists: 'Artistas populares',
      seeAll: 'Ver todo',
    },
  },
  en: {
    accountPreferences: {
      title: 'Account Preferences',
      language: 'Language',
      languageDescription: 'Choose the language you want to use in the application',
      appearance: 'Appearance',
      appearanceDescription: 'Customize how the application looks',
      theme: 'Theme',
      content: 'Content',
      contentDescription: 'Control what type of content you can see',
      allowExplicit: 'Allow explicit content',
      allowExplicitDescription: 'You can view and play content marked as explicit',
      notifications: 'Notifications',
      notificationsDescription: 'Choose which notifications you want to receive',
      newReleases: 'New releases',
      newReleasesDescription: 'Receive notifications when your favorite artists release new music',
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
      lightDescription: 'Light theme always active',
      darkDescription: 'Dark theme always active',
      autoDescription: 'Follows system settings',
    },
    language: {
      spanish: 'Español',
      english: 'English',
    },
    common: {
      cancel: 'Cancel',
      save: 'Save',
      back: 'Back',
    },
    nav: {
      home: 'Home',
      library: 'Library',
      profile: 'Profile',
      explore: 'Explore',
    },
    home: {
      greeting: 'Hello',
      featured: 'Featured Songs',
      popular: 'Popular',
      podcasts: 'Podcasts',
      artists: 'Popular Artists',
      seeAll: 'See all',
    },
  },
};

export const getTranslation = (key: string, language: Language = 'es'): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }
  
  // Si no se encontró la traducción, intentar con español como fallback
  if (value === undefined && language !== 'es') {
    value = translations.es;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }
  }
  
  // Si aún no se encontró, devolver la clave original
  return (typeof value === 'string' ? value : key);
};

