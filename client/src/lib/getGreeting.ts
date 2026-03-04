/**
 * Retorna uma saudação personalizada baseada na hora do dia
 * Bom dia: 5:00 - 11:59
 * Boa tarde: 12:00 - 17:59
 * Boa noite: 18:00 - 4:59
 */
export function getGreeting(userName: string = ""): { greeting: string; emoji: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: `Bom dia${userName ? `, ${userName}` : ""}`,
      emoji: "☀️",
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      greeting: `Boa tarde${userName ? `, ${userName}` : ""}`,
      emoji: "🌤",
    };
  } else {
    return {
      greeting: `Boa noite${userName ? `, ${userName}` : ""}`,
      emoji: "🌙",
    };
  }
}