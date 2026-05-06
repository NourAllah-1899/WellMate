import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Calendar, Users, User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const activityImages: Record<string, any> = {
    running: require('../../../assets/events/Running.png'),
    walking: require('../../../assets/events/Walking.png'),
    cycling: require('../../../assets/events/Cycling.png'),
    yoga: require('../../../assets/events/Yoga.png'),
    basketball: require('../../../assets/events/Basketball.png'),
    swimming: require('../../../assets/events/Swimming.png'),
    fitness: require('../../../assets/events/Fitness.png'),
    football: require('../../../assets/events/Football.png'),
    other: require('../../../assets/events/Running.png'),
};

interface EventCardProps {
    event: any;
    onJoin: (id: number, hasJoined: boolean) => void;
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
}

export default function EventCard({ event, onJoin, onDelete }: EventCardProps) {
    const { isDarkMode } = useTheme();
    const { t } = useLanguage();
    const isLight = !isDarkMode;
    const isFinished = event.status === 'Finished';
    const isFull = event.max_participants && event.participant_count >= event.max_participants;

    return (
        <View style={[styles.card, isLight && styles.cardLight]}>
            <View style={styles.header}>
                <View style={styles.activityContainer}>
                    <Image
                        source={activityImages[event.activity_type?.toLowerCase()] || activityImages.other}
                        style={styles.activityImg}
                    />
                    <View>
                        <Text style={[styles.title, isLight && styles.titleLight]}>{event.title}</Text>
                        <Text style={styles.activityType}>{event.activity_type}</Text>
                    </View>
                </View>
                <View
                    style={[
                        styles.badge,
                        event.status === 'Upcoming' && styles.badgeSuccess,
                        event.status === 'Ongoing' && styles.badgeWarn,
                        event.status === 'Finished' && styles.badgeDanger,
                    ]}
                >
                    <Text style={styles.badgeText}>{event.status}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Calendar size={16} color={isLight ? '#64748b' : '#94a3b8'} />
                    <Text style={[styles.detailText, isLight && styles.detailTextLight]}
                        >{`${new Date(event.date).toLocaleDateString()} @ ${event.time.substring(0, 5)}`}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <User size={16} color={isLight ? '#64748b' : '#94a3b8'} />
                    <Text style={[styles.detailText, isLight && styles.detailTextLight]}
                        >{`${t('events.host')}: `}
                        <Text style={styles.bold}>{event.creator_name}</Text>
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Users size={16} color={isLight ? '#64748b' : '#94a3b8'} />
                    <Text style={[styles.detailText, isLight && styles.detailTextLight]}
                        >{`${event.participant_count} ${t('events.joining')}`}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.joinButton,
                        event.hasJoined && styles.joinedButton,
                        isLight && styles.joinedButtonLight,
                        (isFinished || isFull) && styles.disabledButton,
                    ]}
                    onPress={() => onJoin(event.id, event.hasJoined)}
                    disabled={isFinished || isFull}
                >
                    <Text style={[styles.joinButtonText, event.hasJoined && isLight && styles.joinButtonTextLight]}
                    >{event.hasJoined
                        ? t('events.alreadyJoined')
                        : isFinished
                        ? t('events.eventEnded')
                        : isFull
                        ? t('events.capacityReach')
                        : t('events.joinActivity')}
                    </Text>
                </TouchableOpacity>
                {onDelete && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDelete(event.id)}
                    >
                        <Text style={styles.deleteButtonText}>{t('events.delete')}</Text>
                    </TouchableOpacity>
                )}
                {onEdit && (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => onEdit(event.id)}
                    >
                        <Text style={styles.editButtonText}>{t('events.edit')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    cardLight: {
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
        shadowOpacity: 0.05,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    activityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    activityImg: {
        width: 48,
        height: 48,
        borderRadius: 12,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    titleLight: {
        color: '#0f172a',
    },
    activityType: {
        fontSize: 12,
        color: '#38bdf8',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    bold: {
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeSuccess: { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderWidth: 1, borderColor: '#22c55e' },
    badgeWarn: { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderWidth: 1, borderColor: '#f59e0b' },
    badgeDanger: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderColor: '#ef4444' },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    details: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#94a3b8',
        marginLeft: 8,
    },
    detailTextLight: {
        color: '#64748b',
    },
    joinButton: {
        backgroundColor: '#7c3aed',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    joinedButton: {
        backgroundColor: '#475569',
    },
    joinedButtonLight: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    disabledButton: {
        opacity: 0.5,
    },
    joinButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    joinButtonTextLight: {
        color: '#64748b',
    },
    deleteButton: {
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    deleteButtonText: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
});
