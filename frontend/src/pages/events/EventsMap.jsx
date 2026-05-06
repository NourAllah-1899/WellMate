import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../context/LanguageContext';

// Fix for default marker icons in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const activityIcons = {
    running: '🏃',
    walking: '🚶',
    cycling: '🚴',
    yoga: '🧘',
    basketball: '🏀',
    swimming: '🏊',
    fitness: '🏋️',
    other: '🎯'
};

const EventsMap = ({ events, onJoin }) => {
    const { t } = useLanguage();
    // Center of Tunisia
    const center = [33.8869, 9.5375];

    return (
        <div className="wm-card p-0 overflow-hidden mt-6" style={{ height: '500px' }}>
            <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {events.map(event => (
                    <Marker key={event.id} position={[event.latitude, event.longitude]}>
                        <Popup>
                            <div className="p-1">
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="text-xl">{activityIcons[event.activity_type.toLowerCase()] || activityIcons.other}</span>
                                    <h4 className="font-bold m-0 text-sm">{event.title}</h4>
                                </div>
                                <p className="text-xs wm-muted m-0 mb-1">
                                    {new Date(event.date).toLocaleDateString()} at {event.time.substring(0, 5)}
                                </p>
                                <p className="text-xs wm-muted m-0 mb-2">
                                    👥 {event.participant_count}
                                    {event.max_participants && <span> / {event.max_participants}</span>}
                                    {event.max_participants && event.participant_count >= event.max_participants && (
                                        <span className="text-red-600 font-bold"> (Full)</span>
                                    )}
                                </p>
                                <button 
                                    className={`wm-btn small w-full ${event.hasJoined ? 'secondary' : ''}`}
                                    style={{ padding: '4px 8px', fontSize: '10px' }}
                                    onClick={() => !event.hasJoined && onJoin(event.id)}
                                    disabled={event.hasJoined || event.status === 'Finished' || (!event.hasJoined && event.max_participants && event.participant_count >= event.max_participants)}
                                >
                                    {event.hasJoined ? t('events.alreadyJoined') : (!event.hasJoined && event.max_participants && event.participant_count >= event.max_participants) ? t('events.full') : t('events.joinActivity')}
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default EventsMap;
