module.exports = {
  apps: [{
    name: 'tomaturno',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3100,
      HOST: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
