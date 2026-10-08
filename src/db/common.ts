/** Single-device owner until accounts exist (P4). Every row is written under this id. */
export const LOCAL_USER = 'local';

export const now = () => new Date().toISOString();

export function newId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
