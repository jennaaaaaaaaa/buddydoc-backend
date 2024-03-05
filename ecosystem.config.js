module.exports = {
  apps: [
    {
      name: 'buddydoc',
      script: 'dist/main.js', // 애플리케이션 진입점 파일 경로
      instances: 'max', // 클러스터 인스턴스 수 (max: CPU 코어 수)
      exec_mode: 'cluster', // 클러스터 모드
      autorestart: true
    },
  ],

  // deploy: {
  //   production: {
  //     user: 'SSH_USERNAME',
  //     host: 'SSH_HOST',
  //     ref: 'origin/master',
  //     repo: 'GIT_REPOSITORY',
  //     path: '/var/www/nest-app',
  //     'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
  //   },
  // },
};
