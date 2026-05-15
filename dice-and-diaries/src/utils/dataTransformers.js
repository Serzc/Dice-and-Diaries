// Convierte el objeto character de la UI al formato que espera la API.
export function toDatabaseFormat(characterUI) {
  // Implementa la transformación real si los campos difieren.
  return { ...characterUI };
}

// Convierte el objeto de la API al formato que usa la UI.
export function toUIFormat(characterDB) {
  return { ...characterDB };
}