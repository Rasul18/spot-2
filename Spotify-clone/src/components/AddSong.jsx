import React, { useState, useContext } from 'react'
import { PlayerContext } from '../context/player-context'
import API_URL from '../config/api'
import GENRES from './genres.js'
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js'

const AddSong = () => {
    const { fetchSongs, theme } = useContext(PlayerContext)
    const [formData, setFormData] = useState({
        name: '',
        desc: '',
        duration: '',
        album: '',
        genre: GENRES[0]
    })
    const [audioFile, setAudioFile] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const isDark = theme === 'dark'

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const getDurationInSec = (file) =>
        new Promise((resolve) => {
            const audio = new Audio(URL.createObjectURL(file))
            audio.onloadedmetadata = () => {
                resolve(Math.floor(audio.duration || 0))
                URL.revokeObjectURL(audio.src)
            }
            audio.onerror = () => resolve(0)
        })

    const extractCoverFile = (picture) => {
        if (!picture) return null
        const byteArray = new Uint8Array(picture.data)
        const blob = new Blob([byteArray], { type: picture.format || 'image/jpeg' })
        return new File([blob], 'cover.jpg', { type: blob.type })
    }


    const handleAudioChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setAudioFile(file)

        const durationSec = await getDurationInSec(file)

        jsmediatags.read(file, {
            onSuccess: ({ tags }) => {
                const autoTitle = tags.title || file.name.replace(/\.[^/.]+$/, '')
                const cover = extractCoverFile(tags.picture)

                setFormData((prev) => ({
                    ...prev,
                    name: prev.name || autoTitle,
                    duration: prev.duration || String(durationSec)
                }))

                if (cover && !imageFile) {
                    setImageFile(cover)
                }
            },
            onError: () => {
                const autoTitle = file.name.replace(/\.[^/.]+$/, '')
                setFormData((prev) => ({
                    ...prev,
                    name: prev.name || autoTitle,
                    duration: prev.duration || String(durationSec)
                }))
            }
        })
    }


    const handleImageChange = (e) => {
        setImageFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!audioFile || !imageFile) {
            setMessage('Пожалуйста выберите файл и изображение')
            return
        }

        setLoading(true)
        setMessage('')

        const data = new FormData()
        data.append('file', audioFile)
        data.append('image', imageFile)
        data.append('name', formData.name)
        data.append('desc', formData.desc)
        data.append('duration', formData.duration)
        data.append('album', formData.album)
        data.append('genre', formData.genre)

        try {
            const response = await fetch(`${API_URL}/api/songs`, {
                method: 'POST',
                body: data
            })

            const contentType = response.headers.get('content-type') || ''
            const result = contentType.includes('application/json')
                ? await response.json()
                : { message: await response.text() }

            if (response.ok) {
                setMessage('✅ Песня успешно добавлена!')
                setFormData({ name: '', desc: '', duration: '', album: '', genre: GENRES[0] })
                setAudioFile(null)
                setImageFile(null)
                fetchSongs(true)
            } else {
                const message = response.status === 413
                    ? 'Файл слишком большой. Максимальный размер: 200 MB'
                    : result.message || 'Не удалось загрузить песню'
                setMessage(`❌ Ошибка: ${message}`)
            }
        } catch (error) {
            setMessage(`❌ Ошибка: ${error.message}`)
            console.error('Ошибка:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
            <h2 className='mb-4 text-2xl font-bold'>Добавить новую песню</h2>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <input
                    type="text"
                    name="name"
                    placeholder="Название песни"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`rounded-2xl border p-3 outline-none ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                />

                <input
                    type="text"
                    name="desc"
                    placeholder="Описание"
                    value={formData.desc}
                    onChange={handleInputChange}
                    required
                    className={`rounded-2xl border p-3 outline-none ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                />

                <input
                    type="number"
                    name="duration"
                    placeholder="Длительность (секунды)"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className={`rounded-2xl border p-3 outline-none ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                />

                <input
                    type="text"
                    name="album"
                    placeholder="Альбом"
                    value={formData.album}
                    onChange={handleInputChange}
                    required
                    className={`rounded-2xl border p-3 outline-none ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                />

                <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className={`rounded-2xl border p-3 outline-none ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                >
                    {GENRES.map((genre) => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>

                <div>
                    <label className={`mb-2 block font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Аудиофайл (MP3)</label>
                    <input
                        type="file"
                        accept="audio/*,.mp3,.m4a,.wav,.ogg,.mp4,video/mp4"

                        onChange={handleAudioChange}
                        required
                        className={`w-full rounded-2xl border p-3 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}
                    />
                    {audioFile && <p className='mt-1 text-sm text-emerald-600'>✓ {audioFile.name}</p>}
                </div>

                <div>
                    <label className={`mb-2 block font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Обложка альбома</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        className={`w-full rounded-2xl border p-3 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}
                    />
                    {imageFile && <p className='mt-1 text-sm text-emerald-600'>✓ {imageFile.name}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`rounded-full px-4 py-3 font-bold disabled:bg-slate-300 ${isDark ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                    {loading ? 'Загрузка...' : 'Добавить песню'}
                </button>
            </form>

            {message && (
                <p className={`mt-4 rounded-2xl p-3 ${message.includes('✅') ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'}`}>
                    {message}
                </p>
            )}
        </div>
    )
}

export default AddSong
