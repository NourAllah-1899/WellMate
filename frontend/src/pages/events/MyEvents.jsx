import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const MyEvents = ({ onBack }) => {
    const { t } = useLanguage();
    const [data, setData] = useState({ created: [], joined: [] });
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        activity_type: 'Running',
        date: '',
        time: '',
        description: '',
        max_participants: null,
    });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const res = await api.get('/api/events/my-events');
            if (res.data.success) {
                setData(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (ev) => {
        setEditingId(ev.id);
        setEditForm({
            title: ev.title || '',
            activity_type: ev.activity_type || 'Running',
            date: ev.date ? String(ev.date).slice(0, 10) : '',
            time: ev.time ? String(ev.time).slice(0, 5) : '',
            description: ev.description || '',
            max_participants: ev.max_participants || null,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setSaving(false);
    };

    const saveEdit = async () => {
        if (!editingId) return;
        setSaving(true);
        try {
            const res = await api.put(`/api/events/${editingId}`, {
                title: editForm.title,
                activity_type: editForm.activity_type,
                date: editForm.date,
                time: editForm.time,
                description: editForm.description,
                max_participants: editForm.max_participants,
            });

            if (res.data.success) {
                await fetchData();
                setEditingId(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm(t('events.confirmDelete'))) {
            return;
        }

        setDeleting(eventId);
        try {
            const res = await api.delete(`/api/events/${eventId}`);
            if (res.data.success) {
                await fetchData();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(null);
        }
    };

    const statusLabel = (status) => {
        if (!status) return '';
        const s = String(status).toLowerCase();
        if (s === 'upcoming') return t('events.status.upcoming');
        if (s === 'ongoing') return t('events.status.ongoing');
        if (s === 'finished') return t('events.status.finished');
        return status;
    };

    const renderEventList = (events, emptyMsgKey, isCreator = false) => {
        if (events.length === 0) return <p className="wm-muted text-sm p-4 italic">{t(emptyMsgKey)}</p>;
        return (
            <div className="space-y-3 mt-3">
                {events.map(ev => (
                    <div key={ev.id} className="wm-panel group">
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <p className="font-bold">{ev.title}</p>
                                <p className="text-xs wm-muted">{new Date(ev.date).toLocaleDateString()} • {t(`physicalActivity.types.${String(ev.activity_type).toLowerCase()}`, ev.activity_type)} • {ev.participant_count} {t('events.joining')}{ev.max_participants && <span> / {ev.max_participants}</span>}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`wm-badge text-[10px] ${ev.status === 'Upcoming' ? 'success' : ev.status === 'Ongoing' ? 'warn' : 'danger'}`}>
                                    {statusLabel(ev.status)}
                                </div>
                                {isCreator ? (
                                    <>
                                        <button
                                            onClick={() => startEdit(ev)}
                                            disabled={editingId === ev.id || saving}
                                            className="wm-btn small secondary !w-auto"
                                            title={t('common.edit')}
                                        >
                                            {t('common.edit')}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteEvent(ev.id)}
                                            disabled={deleting === ev.id || saving}
                                            className="wm-btn small secondary !w-auto !border-red-500 hover:!bg-red-600 hover:!text-white"
                                            title={t('common.delete')}
                                        >
                                            {deleting === ev.id ? '...' : t('common.delete')}
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        {isCreator && editingId === ev.id ? (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="wm-field">
                                    {t('events.eventTitle')}
                                    <input
                                        className="wm-input"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                </label>

                                <label className="wm-field">
                                    {t('events.activityType')}
                                    <select
                                        className="wm-input"
                                        value={editForm.activity_type}
                                        onChange={(e) => setEditForm({ ...editForm, activity_type: e.target.value })}
                                    >
                                        <option value="Running">{t('physicalActivity.types.running', 'Running')}</option>
                                        <option value="Walking">{t('physicalActivity.types.walking', 'Walking')}</option>
                                        <option value="Cycling">{t('physicalActivity.types.cycling', 'Cycling')}</option>
                                        <option value="Yoga">{t('physicalActivity.types.yoga', 'Yoga')}</option>
                                        <option value="Basketball">{t('physicalActivity.types.basketball', 'Basketball')}</option>
                                        <option value="Football">{t('physicalActivity.types.football', 'Football')}</option>
                                        <option value="Swimming">{t('physicalActivity.types.swimming', 'Swimming')}</option>
                                        <option value="Fitness">{t('physicalActivity.types.fitness', 'Fitness')}</option>
                                        <option value="Other">{t('physicalActivity.types.other', 'Other')}</option>
                                    </select>
                                </label>

                                <label className="wm-field">
                                    {t('events.date')}
                                    <input
                                        type="date"
                                        className="wm-input"
                                        value={editForm.date}
                                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    />
                                </label>

                                <label className="wm-field">
                                    {t('events.time')}
                                    <input
                                        type="time"
                                        className="wm-input"
                                        value={editForm.time}
                                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                    />
                                </label>

                                <label className="wm-field md:col-span-2">
                                    {t('events.description')}
                                    <textarea
                                        className="wm-input"
                                        rows="3"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </label>

                                <label className="wm-field">
                                    Maximum Participants (Optional)
                                    <input
                                        type="number"
                                        className="wm-input"
                                        placeholder="Leave empty for unlimited"
                                        min="1"
                                        value={editForm.max_participants || ''}
                                        onChange={(e) => setEditForm({ ...editForm, max_participants: e.target.value ? parseInt(e.target.value) : null })}
                                    />
                                </label>

                                <div className="md:col-span-2 flex gap-3">
                                    <button
                                        type="button"
                                        className="wm-btn secondary !w-auto"
                                        onClick={cancelEdit}
                                        disabled={saving}
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        className="wm-btn !w-auto"
                                        onClick={saveEdit}
                                        disabled={saving}
                                    >
                                        {saving ? t('common.loading') : t('common.save')}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="wm-card max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="wm-btn small secondary" style={{ width: '40px', padding: '4px' }}>←</button>
                <h2 className="m-0">{t('events.myEvents')}</h2>
            </div>

            {loading ? (
                <div className="p-8 text-center wm-muted">{t('common.loading')}</div>
            ) : (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold border-b border-border-main pb-2">{t('events.organizedByMe')}</h3>
                        {renderEventList(data.created, 'events.noCreated', true)}
                    </div>

                    <div>
                        <h3 className="text-lg font-bold border-b border-border-main pb-2">{t('events.joinedByMe')}</h3>
                        {renderEventList(data.joined, 'events.noJoined', false)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyEvents;
