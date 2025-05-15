const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// При заходе на '/' — отдавать login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// API: Регистрация
app.post('/api/register', (req, res) => {
  const { username, password, name } = req.body;
  const usersPath = path.join(__dirname, 'data/users.json');
  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }
  const newUser = { id: Date.now().toString(), username, password, name };
  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json({ id: newUser.id, username, name });
});

// API: Вход
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const usersPath = path.join(__dirname, 'data/users.json');
  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Неверные данные' });
  res.json({ id: user.id, username: user.username, name: user.name });
});

// API: Получение игр пользователя
app.get('/api/games/:userId', (req, res) => {
  const userId = req.params.userId;
  const gamesPath = path.join(__dirname, 'data/games.json');
  const games = fs.existsSync(gamesPath) ? JSON.parse(fs.readFileSync(gamesPath)) : [];
  const userGames = games.filter(g => g.userId === userId);
  res.json(userGames);
});

// API: Добавление игры
app.post('/api/games', (req, res) => {
  const { userId, playerName, timeMinutes, points, status } = req.body;
  const gamesPath = path.join(__dirname, 'data/games.json');
  const games = fs.existsSync(gamesPath) ? JSON.parse(fs.readFileSync(gamesPath)) : [];
  const newGame = { id: Date.now().toString(), userId, playerName, timeMinutes, points, status };
  games.push(newGame);
  fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));
  res.json(newGame);
});

// Обработчик для GET /api/games
app.get('/api/games', (req, res) => {
  const filePath = path.join(__dirname, 'data/games.json');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка чтения файла:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
      return;
    }
    try {
      const games = JSON.parse(data);
      res.json(games);
    } catch (parseErr) {
      console.error('Ошибка парсинга JSON:', parseErr);
      res.status(500).json({ error: 'Некорректный формат файла данных' });
    }
  });
});

// API: Обновление профиля
app.post('/api/user/:id', (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;
  const usersPath = path.join(__dirname, 'data/users.json');
  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  user.name = name || user.name;
  if (password) user.password = password;
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json(user);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});