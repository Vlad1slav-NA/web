const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Путь к файлу с данными
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Функция для чтения пользователей
function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            const dataDir = path.dirname(USERS_FILE);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(USERS_FILE, '[]');
            return [];
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Ошибка чтения:', error);
        return [];
    }
}


// Функция для записи пользователей
function writeUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Ошибка записи:', error);
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
        const { firstName, lastName, email, phone, age, gender, city } = req.body;

        // Простая валидация
        if (!firstName || !lastName || !email) {
            return res.json({
                success: false,
                message: 'Имя, фамилия и email обязательны'
            });
        }

        const users = readUsers();

        // Создаем нового пользователя
        const newUser = {
            id: Date.now().toString(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone || '',
            age: age || '',
            gender: gender || '',
            city: city || '',
            registrationDate: new Date().toISOString()
        };

        users.push(newUser);

        if (writeUsers(users)) {
            res.json({
                success: true,
                message: 'Регистрация успешна!'
            });
        } else {
            res.json({
                success: false,
                message: 'Ошибка сохранения'
            });
        }

    } catch (error) {
        console.error('Ошибка:', error);
        res.json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});