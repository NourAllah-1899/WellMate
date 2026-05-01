import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const MyEvents = ({ onBack }) => {
    const [data, setData] = useState({ created: [], joined: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchData();
    }, []);

    const renderEventList = (events, emptyMsg) => {
        if (events.length === 0) return <p className="wm-muted text-sm p-4 italic">{emptyMsg}</p>;
        return (
            <div className="space-y-3 mt-3">
                {events.map(ev => (
                    <div key={ev.id} className="wm-panel flex justify-between items-center group">
                        <div>
                            <p className="font-bold">{ev.title}</p>
                            <p className="text-xs wm-muted">{new Date(ev.date).toLocaleDateString()} • {ev.activity_type} • {ev.participant_count} participants</p>
                        </div>
                        <div className={`wm-badge text-[10px] ${ev.status === 'Upcoming' ? 'success' : ev.status === 'Ongoing' ? 'warn' : 'danger'}`}>
                            {ev.status}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="wm-card max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="wm-btn small secondary" style={{ width: '40px', padding: '4px' }}>←</button>
                <h2 className="m-0">My Activities</h2>
            </div>

            {loading ? (
                <div className="p-8 text-center wm-muted">Loading your events...</div>
            ) : (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold border-b border-border-main pb-2">Organized by Me</h3>
                        {renderEventList(data.created, "You haven't created any events yet.")}
                    </div>

                    <div>
                        <h3 className="text-lg font-bold border-b border-border-main pb-2">Joined by Me</h3>
                        {renderEventList(data.joined, "You haven't joined any events yet.")}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyEvents;
