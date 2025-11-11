// Интерфейс для данных формы
interface RegistrationData {
    username: string;
    email: string;
    password: string;
}

// Получаем форму по id
const form = document.getElementById('registrationForm') as HTMLFormElement;

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement).value.trim();
    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value;

    // Простейшая валидация
    if (username.length === 0) {
        alert('Введите имя пользователя');
        return;
    }

    if (!validateEmail(email)) {
        alert('Введите корректный email');
        return;
    }

    if (password.length < 6) {
        alert('Пароль должен содержать не менее 6 символов');
        return;
    }

    const userData: RegistrationData = {
        username,
        email,
        password,
    };

    console.log('Данные пользователя', userData);

    // Здесь подключите отправку данных на сервер через fetch/ajax и дальнейшую обработку
    alert('Регистрация прошла успешно!');
});

// Функция проверки email через регулярное выражение
function validateEmail(email: string): boolean {
    const re = `/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/`;
    return re.test(email);
}
