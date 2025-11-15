const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Создаем папку data если её нет
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const USERS_FILE = path.join(dataDir, 'users.json');

// Функция для чтения пользователей с обработкой ошибок
function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            // Если файла нет, создаем пустой массив
            fs.writeFileSync(USERS_FILE, JSON.stringify([]));
            return [];
        }

        const data = fs.readFileSync(USERS_FILE, 'utf8');

        // Проверяем, что файл не пустой
        if (!data.trim()) {
            console.log('Файл users.json пустой, создаем новый массив');
            fs.writeFileSync(USERS_FILE, JSON.stringify([]));
            return [];
        }

        const users = JSON.parse(data);

        // Проверяем, что это массив
        if (!Array.isArray(users)) {
            console.log('Файл users.json содержит не массив, исправляем');
            fs.writeFileSync(USERS_FILE, JSON.stringify([]));
            return [];
        }

        return users;
    } catch (error) {
        console.error('Ошибка при чтении файла пользователей:', error);
        // Если файл поврежден, создаем новый
        try {
            fs.writeFileSync(USERS_FILE, JSON.stringify([]));
            console.log('Создан новый файл users.json');
        } catch (writeError) {
            console.error('Ошибка при создании файла:', writeError);
        }
        return [];
    }
}

// Функция для записи пользователей
function writeUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Ошибка при записи файла пользователей:', error);
        return false;
    }
}

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка регистрации
app.post('/register', (req, res) => {
    try {
        console.log('Получены данные регистрации:', req.body);

        const { username, email, password, confirmPassword, age, gender, city } = req.body;

        // Валидация обязательных полей
        if (!username || !email || !password || !confirmPassword) {
            return res.json({
                success: false,
                message: 'Заполните все обязательные поля'
            });
        }

        // Проверка совпадения паролей
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: 'Пароли не совпадают'
            });
        }

        // Проверка длины пароля
        if (password.length < 6) {
            return res.json({
                success: false,
                message: 'Пароль должен содержать не менее 6 символов'
            });
        }

        // Проверка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({
                success: false,
                message: 'Введите корректный email адрес'
            });
        }

        // Проверка имени пользователя
        if (username.length < 3) {
            return res.json({
                success: false,
                message: 'Имя пользователя должно содержать не менее 3 символов'
            });
        }

        // Читаем существующих пользователей
        const users = readUsers();

        // Проверяем уникальность username и email
        const usernameExists = users.find(user => user.username === username);
        if (usernameExists) {
            return res.json({
                success: false,
                message: 'Пользователь с таким именем уже существует'
            });
        }

        const emailExists = users.find(user => user.email === email);
        if (emailExists) {
            return res.json({
                success: false,
                message: 'Пользователь с таким email уже зарегистрирован'
            });
        }

        // Создаем нового пользователя
        const newUser = {
            id: Date.now().toString(),
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: password, // В реальном приложении пароль должен быть хеширован!
            age: age || null,
            gender: gender || '',
            city: city || '',
            registrationDate: new Date().toISOString(),
            lastLogin: null
        };

        users.push(newUser);

        // Сохраняем
        if (writeUsers(users)) {
            console.log(`✅ Новый пользователь зарегистрирован: ${username} (${email})`);

            res.json({
                success: true,
                message: '🎉 Аккаунт успешно создан! Добро пожаловать!',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                }
            });
        } else {
            throw new Error('Ошибка при сохранении данных');
        }

    } catch (error) {
        console.error('❌ Ошибка при регистрации:', error);
        res.json({
            success: false,
            message: 'Произошла ошибка на сервере. Попробуйте позже.'
        });
    }
});

// Получение списка пользователей
app.get('/users', (req, res) => {
    try {
        const users = readUsers();

        // Не возвращаем пароли в списке пользователей
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            count: usersWithoutPasswords.length,
            users: usersWithoutPasswords
        });
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении данных пользователей'
        });
    }
});

// Тестовый endpoint для проверки сервера
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Сервер работает корректно!',
        timestamp: new Date().toISOString()
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`👥 Система регистрации пользователей готова!`);
    console.log(`📊 Список пользователей доступен по: http://localhost:${PORT}/users`);
    console.log(`🧪 Тестовый endpoint: http://localhost:${PORT}/test`);

    // Проверяем инициализацию файла пользователей
    const users = readUsers();
    console.log(`📁 Загружено пользователей: ${users.length}`);
});