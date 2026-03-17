import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

function LoginForm() {
    const [mode, setMode] = useState('login');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleForm = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Ошибка авторизации');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        }
        catch {
            setError('Сервер недоступен');
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='max-w-md mx-auto mt-10 bg-[#181818] rounded-xl p-6'>
            <h2 className='text-2xl font-bold mb-2'>
                {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
            </h2>
            <p className='text-sm text-gray-400 mb-5'>
                {mode === 'login'
                    ? 'Введи логин и пароль, чтобы войти'
                    : 'Создай логин и пароль, чтобы зарегистрироваться'}
            </p>

            <form onSubmit={handleForm} className='flex flex-col gap-4'>
                <input
                    className='bg-[#242424] rounded px-4 py-3 outline-none'
                    type='text'
                    placeholder='Логин'
                    minLength={3}
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <input
                    className='bg-[#242424] rounded px-4 py-3 outline-none'
                    type='password'
                    placeholder='Пароль'
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className='text-red-400 text-sm'>{error}</p>}

                <button
                    className='bg-green-500 hover:bg-green-400 text-black font-semibold rounded-full py-3 disabled:opacity-60'
                    type='submit'
                    disabled={isLoading}
                >
                    {isLoading
                        ? 'Загрузка...'
                        : mode === 'login'
                            ? 'Войти'
                            : 'Создать аккаунт'}
                </button>
            </form>

            <button
                className='mt-4 text-sm text-gray-300 underline'
                type='button'
                onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                }}
            >
                {mode === 'login'
                    ? 'Нет аккаунта? Зарегистрироваться'
                    : 'Уже есть аккаунт? Войти'}
            </button>
        </div>
    );
}

export default LoginForm;
