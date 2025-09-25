module.exports = {
  apps: [{
    name: 'toma-turno',
    script: 'npm',
    args: 'run start:prod',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3005,
      HOST: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3005,
      HOST: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    autorestart: true,
    cron_restart: '0 3 * * *'  // Restart diario a las 3 AM
  }]
};
