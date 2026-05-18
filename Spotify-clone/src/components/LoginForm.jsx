import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import { useContext } from 'react';
import { PlayerContext } from '../context/player-context';

function LoginForm() {
    const [mode, setMode] = useState('login');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { theme } = useContext(PlayerContext);
    const isDark = theme === 'dark';

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
            window.dispatchEvent(new Event('auth-changed'));
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
        <div className={`mx-auto mt-10 max-w-md rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h2 className={`mb-2 text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
            </h2>
            <p className={`mb-5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {mode === 'login'
                    ? 'Введи логин и пароль, чтобы войти'
                    : 'Создай логин и пароль, чтобы зарегистрироваться'}
            </p>

            <form onSubmit={handleForm} className='flex flex-col gap-4'>
                <input
                    className={`rounded-2xl border px-4 py-3 outline-none ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50'}`}
                    type='text'
                    placeholder='Логин'
                    minLength={3}
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <input
                    className={`rounded-2xl border px-4 py-3 outline-none ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50'}`}
                    type='password'
                    placeholder='Пароль'
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className='text-sm text-rose-600'>{error}</p>}

                <button
                    className={`rounded-full py-3 font-semibold disabled:opacity-60 ${isDark ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
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
                className={`mt-4 text-sm underline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
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
