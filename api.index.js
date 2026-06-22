const { spawn } = require('child_process');
const path = require('path');

// Запускаем NestJS бекенд
const backendPath = path.join(__dirname, '../diploma/backend/dist/main.js');

// Функция для обработки запросов
module.exports = async (req, res) => {
  // Перенаправляем все запросы к бекенду
  try {
    // Проверяем, существует ли файл бекенда
    const fs = require('fs');
    if (!fs.existsSync(backendPath)) {
      return res.status(500).json({ 
        error: 'Backend not built yet',
        path: backendPath 
      });
    }

    // Запускаем бекенд через spawn
    const server = spawn('node', [backendPath]);
    
    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`Backend stdout: ${data}`);
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Backend stderr: ${data}`);
    });

    // Ждем немного для запуска сервера
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Возвращаем ответ
    res.status(200).json({ 
      status: 'Backend started',
      output: output.slice(0, 200),
      error: errorOutput.slice(0, 200)
    });

  } catch (error) {
    console.error('Error starting backend:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
};