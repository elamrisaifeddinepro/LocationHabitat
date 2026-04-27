export const environment = {
  production: false,

  
  authProvider: 'backend' as 'mock' | 'supabase' | 'backend',

  authApiUrl: 'https://locationhabitat-auth-service.onrender.com/api/auth',
  businessApiUrl: 'https://locationhabitat-business-service.onrender.com/api',

  supabaseUrl: '',
  supabaseAnonKey: ''
};