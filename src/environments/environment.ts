export const environment = {
  production: false,

  /**
   * TP mode:
   * - 'mock': utilise assets/mock/*.json + localStorage (sans backend)
   * - 'supabase': utilise Supabase (si vous l'avez configuré)
   */
  // IMPORTANT: typage élargi pour éviter TS2367 lors des comparaisons
  // (Angular/TS considère sinon que 'mock' est un literal strict et que
  // comparer à 'supabase' est "toujours faux").
  authProvider: 'mock' as 'mock' | 'supabase',

  supabaseUrl: 'https://tozjblocziztrcdficfr.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvempibG9jeml6dHJjZGZpY2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Mzc3ODMsImV4cCI6MjA4NjQxMzc4M30.R4yRz33yT6SgYOQViENhQ9Mpjv8dLjLzYjEeDpoxGnQ'
};
