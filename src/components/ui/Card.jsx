/**
 * @file Card.jsx
 * @description Componente UI Card reutilizable. Se implementa en Fase 2.
 */
export function Card({ children, ...props }) {
  return <div {...props}>{children}</div>
}
