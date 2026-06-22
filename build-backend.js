const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building backend...');

// Переходим в папку backend
process.chdir('diploma/backend');

// Проверяем наличие package.json
if (!fs.existsSync('package.json')) {
  console.error('package.json not found in backend directory');
  process.exit(1);
}

// Устанавливаем зависимости с флагом --legacy-peer-deps
console.log('Installing backend dependencies...');
execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

// Проверяем наличие @nestjs/cli
try {
  require.resolve('@nestjs/cli/bin/nest.js');
  console.log('✅ @nestjs/cli found');
} catch (e) {
  console.log('❌ @nestjs/cli not found, installing...');
  execSync('npm install @nestjs/cli --save-dev --legacy-peer-deps', { stdio: 'inherit' });
}

// Собираем проект
console.log('Building backend...');
execSync('npx @nestjs/cli build', { stdio: 'inherit' });

console.log('✅ Backend built successfully');