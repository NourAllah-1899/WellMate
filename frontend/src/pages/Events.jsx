import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import EventsFeed from './events/EventsFeed';
import EventsMap from './events/EventsMap';
import CreateEvent from './events/CreateEvent';
import MyEvents from './events/MyEvents';

export default function Events() {
    const [view, setView] = useState('feed'); // 'feed', 'map', 'create', 'my'
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActivity, setFilterActivity] = useState('All');

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/events');
            if (res.data.success) {
                setEvents(res.data.events);
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError('Failed to load events. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'feed' || view === 'map') {
            fetchEvents();
        }
    }, [view, fetchEvents]);

    const handleJoin = async (eventId, hasJoined) => {
        try {
            if (hasJoined) {
                const res = await api.delete(`/api/events/${eventId}/join`);
                if (res.data.success) {
                    fetchEvents();
                    alert('Successfully left the event.');
                }
            } else {
                const res = await api.post(`/api/events/${eventId}/join`, {});
                if (res.data.success) {
                    fetchEvents();
                    alert('Successfully joined the event!');
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed.');
        }
    };

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             e.activity_type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesActivity = filterActivity === 'All' || e.activity_type === filterActivity;
        return matchesSearch && matchesActivity;
    });

    const renderContent = () => {
        switch (view) {
            case 'create':
                return <CreateEvent onCreated={() => setView('feed')} onCancel={() => setView('feed')} />;
            case 'my':
                return <MyEvents onBack={() => setView('feed')} />;
            case 'map':
                return <EventsMap events={filteredEvents} onJoin={handleJoin} />;
            case 'feed':
            default:
                return <EventsFeed events={filteredEvents} onJoin={handleJoin} loading={loading} setView={setView} />;
        }
    };

    return (
        <div className="wm-container max-w-[1100px]">
            {/* Hero Section */}
            {(view === 'feed' || view === 'map') && (
                <div className="relative overflow-hidden rounded-3xl mb-8 p-8 md:p-12 border border-white/20 shadow-2xl" 
                     style={{ 
                         background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-action) 100%)',
                         color: 'white'
                     }}>
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-white text-4xl md:text-5xl mb-4 leading-tight">Move Together, <br/>Stay Healthy.</h1>
                        <p className="text-white/80 text-lg mb-8 max-w-md">
                            Discover local activities, join passionate groups, and make fitness a social experience.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                                <span className="block text-2xl font-black">{events.length}</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">Active Events</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                                <span className="block text-2xl font-black">{events.reduce((acc, e) => acc + e.participant_count, 0)}</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">Participants</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute right-10 top-10 w-40 h-40 bg-brand-hover/20 rounded-full blur-2xl"></div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white/50 dark:bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-border-main">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button 
                        className={`wm-btn small ${view === 'feed' ? '' : 'secondary'}`}
                        onClick={() => setView('feed')}
                    >
                        📰 Feed
                    </button>
                    <button 
                        className={`wm-btn small ${view === 'map' ? '' : 'secondary'}`}
                        onClick={() => setView('map')}
                    >
                        📍 Map View
                    </button>
                    <button 
                        className={`wm-btn small success`}
                        onClick={() => setView('create')}
                    >
                        ✨ Create Event
                    </button>
                    <button 
                        className={`wm-btn small secondary`}
                        onClick={() => setView('my')}
                    >
                        👤 My Events
                    </button>
                </div>

                {(view === 'feed' || view === 'map') && (
                    <div className="flex gap-3 w-full md:w-auto">
                        <input 
                            type="text" 
                            className="wm-input !mt-0 !py-2 text-sm max-w-[200px]" 
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <select 
                            className="wm-input !mt-0 !py-2 text-sm"
                            value={filterActivity}
                            onChange={e => setFilterActivity(e.target.value)}
                        >
                            <option value="All">All Activities</option>
                            <option value="Running">Running</option>
                            <option value="Walking">Walking</option>
                            <option value="Cycling">Cycling</option>
                            <option value="Yoga">Yoga</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Football">Football</option>
                        </select>
                    </div>
                )}
            </div>

            {error && (
                <div className="wm-card mb-6 border-red-500/50 bg-red-500/5">
                    <p className="wm-error text-center m-0">{error}</p>
                </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderContent()}
            </div>
        </div>
    );
}

