import React from 'react';
import noEventsImg from '../../assets/no-events.png';

import RunningImg from '../../assets/Events/Running.png';
import WalkingImg from '../../assets/Events/Walking.png';
import CyclingImg from '../../assets/Events/Cycling.png';
import YogaImg from '../../assets/Events/Yoga.png';
import BasketballImg from '../../assets/Events/Basketball.png';
import SwimmingImg from '../../assets/Events/Swimming.png';
import FitnessImg from '../../assets/Events/Fitness.png';
import FootballImg from '../../assets/Events/Football.png';

const activityImages = {
    running: RunningImg,
    walking: WalkingImg,
    cycling: CyclingImg,
    yoga: YogaImg,
    basketball: BasketballImg,
    swimming: SwimmingImg,
    fitness: FitnessImg,
    football: FootballImg,
    other: RunningImg
};

const EventsFeed = ({ events, onJoin, loading, setView }) => {
    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 wm-muted font-bold">Discovering events near you...</p>
        </div>
    );

    if (events.length === 0) return (
        <div className="wm-card p-12 text-center flex flex-col items-center animate-in zoom-in duration-700">
            <img src={noEventsImg} alt="No events" className="w-64 h-auto mb-8 opacity-90 drop-shadow-xl" />
            <h2 className="text-2xl font-black mb-2">No activities found</h2>
            <p className="wm-muted max-w-sm mb-8">
                It's a bit quiet here. Be the pioneer and start a new community event today!
            </p>
            <button className="wm-btn !w-auto px-8" onClick={() => setView('create')}>
                🚀 Launch First Event
            </button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
                <div key={event.id} className="wm-card !p-0 flex flex-col overflow-hidden hover:-translate-y-2 transition-all duration-300 group hover:shadow-2xl cursor-pointer">
                    <div className="h-32 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0">
                        <img 
                            src={activityImages[event.activity_type.toLowerCase()] || activityImages.other} 
                            alt={event.activity_type}
                            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                        <div className="absolute top-3 right-3">
                             <div className={`wm-badge ${event.status === 'Upcoming' ? 'success' : event.status === 'Ongoing' ? 'warn' : 'danger'}`}>
                                {event.status}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-4">
                            <h3 className="font-black text-xl mb-1 group-hover:text-brand-primary transition-colors">{event.title}</h3>
                            <p className="text-xs font-bold text-brand-action uppercase tracking-widest">{event.activity_type}</p>
                        </div>

                        <div className="space-y-2.5 text-sm mb-6 flex-1">
                            <div className="flex items-center gap-3 wm-muted">
                                <span className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">📅</span>
                                <span className="font-semibold">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} @ {event.time.substring(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-3 wm-muted">
                                <span className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">👤</span>
                                <span>Host: <span className="text-primary font-bold">{event.creator_name}</span></span>
                            </div>
                            <div className="flex items-center gap-3 wm-muted">
                                <span className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">👥</span>
                                <span className="font-bold text-primary">{event.participant_count} joining</span>
                            </div>
                        </div>

                        <button 
                            className={`wm-btn !mt-auto ${event.hasJoined ? 'secondary border-red-500 hover:bg-red-500 hover:text-white group/btn' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onJoin(event.id, event.hasJoined);
                            }}
                            disabled={event.status === 'Finished'}
                        >
                            {event.hasJoined ? (
                                <span className="group-hover/btn:hidden">Already Joined ✓</span>
                            ) : event.status === 'Finished' ? 'Event Ended' : 'Join Activity'}
                            {event.hasJoined && <span className="hidden group-hover/btn:inline">Leave Activity</span>}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventsFeed;

