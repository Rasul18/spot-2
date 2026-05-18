import React from 'react'
import {assets} from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { readStoredJson } from '../utils/storage'
import { useContext } from 'react'
import { PlayerContext } from '../context/player-context'

const Sidebar = () => {

    const navigate = useNavigate();
    const user = readStoredJson('user');
    const { theme, toggleTheme } = useContext(PlayerContext);
    const isDark = theme === 'dark';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-changed'));
        navigate('/login');
    };

    const navItems = [
        { label: 'Home', icon: assets.home_icon, action: () => navigate('/') },
        { label: 'Search', icon: assets.search_icon, action: () => navigate('/search') },
        { label: 'Library', icon: assets.stack_icon, action: () => navigate('/library') },
    ];

  return (
    <>
        <div className={`sticky top-0 z-30 border-b px-3 py-2 backdrop-blur lg:hidden ${isDark ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-white/95'}`}>
            <div className='grid grid-cols-4 gap-2'>
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        type='button'
                        onClick={item.action}
                        className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-xs font-medium ${isDark ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                    >
                        <img className='w-5' src={item.icon} alt="" />
                        <span>{item.label}</span>
                    </button>
                ))}
                <button
                    type='button'
                    onClick={toggleTheme}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-xs font-medium ${isDark ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                >
                    <span className='text-base'>{isDark ? '☀' : '☾'}</span>
                    <span>{isDark ? 'Light' : 'Dark'}</span>
                </button>
            </div>
        </div>

        <div className='hidden h-screen w-full max-w-[280px] shrink-0 flex-col gap-3 p-3 lg:flex xl:max-w-[300px]'>
            <div className={`rounded-3xl border p-4 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div className='space-y-2'>
                    <div onClick={() => navigate('/')} className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition ${isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>
                        <img className='w-5' src={assets.home_icon} alt="" />
                        <p className='font-semibold'>Home</p>
                    </div>
                    <div onClick={() => navigate('/search')} className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition ${isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>
                        <img className='w-5' src={assets.search_icon} alt="" />
                        <p className='font-semibold'>Search</p>
                    </div>
                </div>
            </div>
            <div className={`flex-1 rounded-3xl border p-4 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div onClick={() => navigate('/library')} className={`flex cursor-pointer items-center justify-between rounded-2xl px-2 py-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    <div className='flex items-center gap-3'>
                        <img className='w-6' src={assets.stack_icon} alt="" />
                        <p className='font-semibold'>Your Library</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <img className='w-4' src={assets.arrow_icon} alt="" />
                        <img className='w-4' src={assets.plus_icon} alt="" />
                    </div>
                </div>
                <div className={`mt-4 rounded-3xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                    <h1 className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Create your first playlist</h1>
                    <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>It&apos;s easy, we will help you.</p>
                    <button onClick={() => navigate('/playlist/new')} className={`mt-4 rounded-full px-4 py-2 text-sm font-semibold ${isDark ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white'}`}>
                        Create playlist
                    </button>
                </div>
                <div className={`mt-4 rounded-3xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                    <h1 className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Find podcasts to follow</h1>
                    <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>We&apos;ll keep you updated on new episodes.</p>
                    <button onClick={() => navigate('/podcasts')} className={`mt-4 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${isDark ? 'bg-slate-900 text-slate-100 ring-slate-700' : 'bg-white text-slate-900 ring-slate-200'}`}>
                        Browse podcasts
                    </button>
                </div>
                <div className={`mt-4 rounded-3xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                    {user ? (
                        <>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Вы вошли как</p>
                            <p className={`mt-1 font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{user.login}</p>
                            <button onClick={handleLogout} className='mt-4 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200'>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Аккаунт не выбран</p>
                            <button onClick={() => navigate('/login')} className={`mt-4 rounded-full px-4 py-2 text-sm font-semibold ${isDark ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white'}`}>
                                Войти или зарегистрироваться
                            </button>
                        </>
                    )}
                </div>
                <button
                    type='button'
                    onClick={toggleTheme}
                    className={`mt-4 w-full rounded-full px-4 py-2 text-sm font-semibold ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700'}`}
                >
                    {isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
                </button>
            </div>
        </div>
    </>
  )
}

export default Sidebar
