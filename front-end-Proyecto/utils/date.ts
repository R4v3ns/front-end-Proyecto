
export function formatBirthDateFromISO(isoDate: string | null | undefined): string {
  if (!isoDate) return '';

  try {
    // Si ya está en formato DD/MM/YYYY, retornarlo tal cual
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(isoDate)) {
      return isoDate;
    }

    // Si es una fecha ISO completa (con hora), extraer solo la fecha
    let dateStr = isoDate;
    if (isoDate.includes('T')) {
      dateStr = isoDate.split('T')[0];
    }

    // Si es formato YYYY-MM-DD, convertir a DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }

    // Si es otro formato, intentar parsearlo como Date
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', isoDate);
      return '';
    }

    // Formatear a DD/MM/YYYY usando la fecha local (sin conversión UTC)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formateando fecha desde ISO:', error);
    return '';
  }
}

export function formatBirthDateToBackend(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  try {
    // Si ya está en formato YYYY-MM-DD, retornarlo tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Si es formato DD/MM/YYYY, convertir a YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      // Validar que la fecha sea válida
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida:', dateStr);
        return '';
      }
      // Retornar en formato YYYY-MM-DD (sin hora, sin UTC)
      return `${year}-${month}-${day}`;
    }

    console.warn('Formato de fecha no reconocido:', dateStr);
    return '';
  } catch (error) {
    console.error('Error formateando fecha para backend:', error);
    return '';
  }
}

/**
 * Valida que una fecha en formato DD/MM/YYYY sea válida
 * @param dateStr - Fecha en formato DD/MM/YYYY
 * @returns true si la fecha es válida, false en caso contrario
 */
export function isValidBirthDate(dateStr: string): boolean {
  if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return false;
  }

  try {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Verificar que la fecha sea válida y que coincida con los valores ingresados
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year &&
      year >= 1900 &&
      year <= new Date().getFullYear()
    );
  } catch {
    return false;
  }
}

/**
 * Formatea automáticamente el input de fecha mientras el usuario escribe (DD/MM/YYYY)
 * @param input - Texto ingresado por el usuario
 * @returns Texto formateado en DD/MM/YYYY
 */
export function formatBirthDateInput(input: string): string {
  // Remover todo lo que no sea número
  const numbers = input.replace(/\D/g, '');

  // Limitar a 8 dígitos (DDMMYYYY)
  const limited = numbers.slice(0, 8);

  // Formatear según la longitud
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 4) {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  } else {
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
  }
}

