import React, { useState } from 'react'

const AddSong = () => {
    const [formData, setFormData] = useState({
        name: '',
        desc: '',
        duration: '',
        album: ''
    });
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAudioChange = (e) => {
        setAudioFile(e.target.files[0]);
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!audioFile || !imageFile) {
            setMessage('Пожалуйста выберите файл и изображение');
            return;
        }

        setLoading(true);
        setMessage('');

        const data = new FormData();
        data.append('file', audioFile);        // ТОЧНО 'file'
        data.append('image', imageFile);       // ТОЧНО 'image'
        data.append('name', formData.name);
        data.append('desc', formData.desc);
        data.append('duration', formData.duration);
        data.append('album', formData.album);

        try {
            const response = await fetch('http://localhost:5000/api/songs', {
                method: 'POST',
                body: data  // НЕ устанавливаем Content-Type, браузер сам
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('✅ Песня успешно добавлена!');
                setFormData({ name: '', desc: '', duration: '', album: '' });
                setAudioFile(null);
                setImageFile(null);
            } else {
                setMessage(`❌ Ошибка: ${result.message}`);
            }
        } catch (error) {
            setMessage(`❌ Ошибка: ${error.message}`);
            console.error('Ошибка:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='p-6 bg-[#242424] rounded text-white'>
            <h2 className='text-2xl font-bold mb-4'>Добавить новую песню</h2>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <input
                    type="text"
                    name="name"
                    placeholder="Название песни"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className='p-2 rounded bg-[#333333] text-white'
                />

                <input
                    type="text"
                    name="desc"
                    placeholder="Описание"
                    value={formData.desc}
                    onChange={handleInputChange}
                    required
                    className='p-2 rounded bg-[#333333] text-white'
                />

                <input
                    type="number"
                    name="duration"
                    placeholder="Длительность (секунды)"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className='p-2 rounded bg-[#333333] text-white'
                />

                <input
                    type="text"
                    name="album"
                    placeholder="Альбом"
                    value={formData.album}
                    onChange={handleInputChange}
                    required
                    className='p-2 rounded bg-[#333333] text-white'
                />

                <div>
                    <label className='block mb-2'>Аудиофайл (MP3)</label>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                        required
                        className='p-2 rounded bg-[#333333] w-full'
                    />
                    {audioFile && <p className='text-sm text-green-400 mt-1'>✓ {audioFile.name}</p>}
                </div>

                <div>
                    <label className='block mb-2'>Обложка альбома</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        className='p-2 rounded bg-[#333333] w-full'
                    />
                    {imageFile && <p className='text-sm text-green-400 mt-1'>✓ {imageFile.name}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className='px-4 py-2 bg-green-500 text-black font-bold rounded hover:bg-green-600 disabled:bg-gray-500'
                >
                    {loading ? 'Загрузка...' : 'Добавить песню'}
                </button>
            </form>

            {message && (
                <p className={`mt-4 p-2 rounded ${message.includes('✅') ? 'bg-green-500' : 'bg-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default AddSong;
