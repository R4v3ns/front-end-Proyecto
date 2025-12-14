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
      error: 'Error',
      success: 'Éxito',
      delete: 'Eliminar',
    },
    nav: {
      home: 'Inicio',
      library: 'Biblioteca',
      profile: 'Perfil',
      explore: 'Explorar',
    },
    home: {
      greeting: 'Hola',
      subtitle: '¿Qué deseas escuchar hoy?',
      featured: 'Canciones destacadas',
      featuredSongs: 'Canciones del momento',
      popular: 'Popular',
      podcasts: 'Podcasts',
      artists: 'Artistas populares',
      seeAll: 'Ver todo',
      loginMessage: 'Inicia sesión para ver tu contenido personalizado',
      loginButton: 'Iniciar sesión',
    },
    library: {
      title: 'Tu biblioteca',
      playlists: 'Playlists',
      liked: 'Canciones que te gustan',
      emptyPlaylists: 'No tienes playlists aún',
      emptyPlaylistsSubtext: 'Crea tu primera playlist para comenzar',
      emptyLiked: 'No tienes canciones guardadas',
      emptyLikedSubtext: 'Dale like a las canciones que te gusten',
      emptyLogin: 'Inicia sesión para ver tu biblioteca',
      createPlaylist: 'Crear playlist',
      createPlaylistTitle: 'Crear nueva playlist',
      playlistNamePlaceholder: 'Nombre de la playlist',
      creating: 'Creando...',
      create: 'Crear',
      deletePlaylist: 'Eliminar playlist',
      deleteConfirm: '¿Estás seguro de que quieres eliminar "{name}"?',
      deleteSuccess: 'Playlist eliminada',
      createSuccess: 'Playlist creada correctamente',
      deleteError: 'No se pudo eliminar la playlist',
      createError: 'No se pudo crear la playlist',
      nameRequired: 'El nombre de la playlist es requerido',
      songs: 'canciones',
    },
    profile: {
      title: 'Perfil',
      editProfile: 'Editar perfil',
      changePassword: 'Cambiar contraseña',
      preferences: 'Preferencias',
      logout: 'Cerrar sesión',
      user: 'Usuario',
    },
    explore: {
      newReleases: 'Nuevos lanzamientos',
      newReleasesEmpty: 'No hay nuevos lanzamientos disponibles',
      popularArtists: 'Artistas populares',
      popularArtistsEmpty: 'No hay artistas populares disponibles',
      popularAlbums: 'Álbumes populares',
      popularAlbumsEmpty: 'No hay álbumes populares disponibles',
      genres: 'Explorar por género',
      genresEmpty: 'No hay géneros disponibles',
      featured: 'Destacado',
      seeAll: 'Ver todo',
      noContent: 'No hay contenido disponible',
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
      error: 'Error',
      success: 'Success',
      delete: 'Delete',
    },
    nav: {
      home: 'Home',
      library: 'Library',
      profile: 'Profile',
      explore: 'Explore',
    },
    home: {
      greeting: 'Hello',
      subtitle: 'What would you like to listen to today?',
      featured: 'Featured Songs',
      featuredSongs: 'Songs of the Moment',
      popular: 'Popular',
      podcasts: 'Podcasts',
      artists: 'Popular Artists',
      seeAll: 'See all',
      loginMessage: 'Sign in to see your personalized content',
      loginButton: 'Sign in',
    },
    library: {
      title: 'Your Library',
      playlists: 'Playlists',
      liked: 'Liked Songs',
      emptyPlaylists: 'You don\'t have any playlists yet',
      emptyPlaylistsSubtext: 'Create your first playlist to get started',
      emptyLiked: 'You don\'t have any saved songs',
      emptyLikedSubtext: 'Like songs you enjoy',
      emptyLogin: 'Sign in to view your library',
      createPlaylist: 'Create Playlist',
      createPlaylistTitle: 'Create New Playlist',
      playlistNamePlaceholder: 'Playlist name',
      creating: 'Creating...',
      create: 'Create',
      deletePlaylist: 'Delete Playlist',
      deleteConfirm: 'Are you sure you want to delete "{name}"?',
      deleteSuccess: 'Playlist deleted',
      createSuccess: 'Playlist created successfully',
      deleteError: 'Could not delete playlist',
      createError: 'Could not create playlist',
      nameRequired: 'Playlist name is required',
      songs: 'songs',
    },
    profile: {
      title: 'Profile',
      editProfile: 'Edit Profile',
      changePassword: 'Change Password',
      preferences: 'Preferences',
      logout: 'Sign Out',
      user: 'User',
    },
    explore: {
      newReleases: 'New Releases',
      newReleasesEmpty: 'No new releases available',
      popularArtists: 'Popular Artists',
      popularArtistsEmpty: 'No popular artists available',
      popularAlbums: 'Popular Albums',
      popularAlbumsEmpty: 'No popular albums available',
      genres: 'Explore by Genre',
      genresEmpty: 'No genres available',
      featured: 'Featured',
      seeAll: 'See all',
      noContent: 'No content available',
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

