/**
 * @file truncateText.js
 * @description Trunca texto a una longitud máxima con ellipsis.
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima (default: 150)
 */
export function truncateText(text, maxLength = 150) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
