export const environment = {
  production: false,

  /**
   * Modes disponibles :
   * - 'mock'
   * - 'supabase'
   * - 'backend'
   */
  authProvider: 'backend' as 'mock' | 'supabase' | 'backend',

  authApiUrl: 'https://locationhabitat-auth-service.onrender.com/api/auth',
  businessApiUrl: 'https://locationhabitat-business-service.onrender.com/api',

  supabaseUrl: 'https://tozjblocziztrcdficfr.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvempibG9jeml6dHJjZGZpY2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Mzc3ODMsImV4cCI6MjA4NjQxMzc4M30.R4yRz33yT6SgYOQViENhQ9Mpjv8dLjLzYjEeDpoxGnQ'
};