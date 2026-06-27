// Admin auth delegates to the main auth store.
// The admin panel uses the same JWT from /api/auth/login;
// access is granted when user.rol === 'admin'.
export { useAuthStore as useAdminAuthStore } from './auth.store';
