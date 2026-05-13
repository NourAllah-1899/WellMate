import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const activityTypes = ['Running', 'Walking', 'Cycling', 'Yoga', 'Basketball', 'Football', 'Swimming', 'Fitness', 'Other'];

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const CreateEvent = ({ onCreated, onCancel }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        title: '',
        activity_type: 'Running',
        date: '',
        time: '',
        description: '',
        max_participants: null,
    });
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!position) {
            setError(t('events.locationRequired'));
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.post('/api/events', {
                ...formData,
                latitude: position.lat,
                longitude: position.lng
            });

            if (res.data.success) {
                onCreated();
            }
        } catch (err) {
            setError(err.response?.data?.message || t('events.createFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wm-card max-w-3xl mx-auto border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-in slide-in-from-top-8 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-border-main pb-4">
                <div>
                    <h2 className="text-2xl font-black">{t('events.organizeTitle')}</h2>
                    <p className="wm-muted text-sm">{t('events.organizeSubtitle')}</p>
                </div>
                <button onClick={onCancel} className="wm-chat-close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="wm-form space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="wm-field">{t('events.eventTitle')}</label>
                        <input 
                            type="text" 
                            className="wm-input" 
                            placeholder={t('events.eventTitlePlaceholder')}
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            required 
                        />
                    </div>

                    <div>
                        <label className="wm-field">{t('events.activityType')}</label>
                        <div className="relative">
                            <select 
                                className="wm-input appearance-none"
                                value={formData.activity_type}
                                onChange={e => setFormData({...formData, activity_type: e.target.value})}
                            >
                                {activityTypes.map(type => (
                                    <option key={type} value={type}>{t(`physicalActivity.types.${String(type).toLowerCase()}`, type)}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="wm-field">{t('events.date')}</label>
                            <input 
                                type="date" 
                                className="wm-input" 
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                required 
                            />
                        </div>
                        <div>
                            <label className="wm-field">{t('events.time')}</label>
                            <input 
                                type="time" 
                                className="wm-input" 
                                value={formData.time}
                                onChange={e => setFormData({...formData, time: e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="wm-field">{t('events.description')}</label>
                    <textarea 
                        className="wm-input !rounded-2xl" 
                        placeholder={t('events.descriptionPlaceholder')}
                        rows="3"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>

                <div>
                    <label className="wm-field">{t('events.maxParticipants')}</label>
                    <input 
                        type="number" 
                        className="wm-input" 
                        placeholder={t('events.maxParticipantsPlaceholder')}
                        min="1"
                        value={formData.max_participants || ''}
                        onChange={e => setFormData({...formData, max_participants: e.target.value ? parseInt(e.target.value) : null})}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('events.maxParticipantsHint')}</p>
                </div>

                <div className="space-y-3">
                    <label className="wm-field flex items-center justify-between">
                        <span>{t('events.location')}</span>
                        {position && (
                            <span className="text-[10px] bg-brand-action/10 text-brand-action px-2 py-0.5 rounded-full font-bold">
                                GPS: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                            </span>
                        )}
                    </label>
                    <div className="rounded-3xl overflow-hidden border-2 border-border-main shadow-inner group relative" style={{ height: '350px' }}>
                        <MapContainer center={[33.8869, 9.5375]} zoom={6} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationPicker position={position} setPosition={setPosition} />
                        </MapContainer>
                        {!position && (
                            <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                                <div className="bg-white/90 dark:bg-slate-800/90 px-4 py-2 rounded-full shadow-lg font-bold text-sm animate-bounce">
                                    {t('events.pinLocationHint')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                        <p className="wm-error text-sm text-center m-0 font-bold">{error}</p>
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button type="button" className="wm-btn secondary !w-1/3" onClick={onCancel}>{t('events.discard')}</button>
                    <button type="submit" className="wm-btn !w-2/3 shadow-xl shadow-brand-primary/20" disabled={loading}>
                        {loading ? t('events.creating') : t('events.publishEvent')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEvent;
