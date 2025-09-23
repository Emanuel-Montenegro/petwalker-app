module.exports = {
  apps: [{
    name: 'pet-walker-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000
    },
    // Configuraciones de producción
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Configuraciones de reinicio
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    // Configuraciones de monitoreo
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    // Configuraciones de cluster
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Variables de entorno específicas
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};