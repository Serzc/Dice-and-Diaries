// Simula una base de datos de usuarios y la llamada de inicio de sesión.
// Reemplaza el cuerpo de la función cuando tengas un backend real.

const fakeUsers = [
  { id: 1, username: "GM_Dave", isGM: true },
  { id: 2, username: "Player_Anna", isGM: false },
];

/**
 * Intenta autenticar al usuario.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object|null>} Datos del usuario o null si falla.
 */
export async function loginUser(username, password) {
  // Simulamos un retardo de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Para el mock, la contraseña no se comprueba, solo el nombre de usuario.
  const user = fakeUsers.find((u) => u.username === username);
  return user ? { ...user } : null;
}