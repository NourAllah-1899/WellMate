import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const MockMap = () => {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {[...Array(20)].map((_, i) => (
                    <View key={i} style={styles.line} />
                ))}
            </View>
            <View style={styles.overlay}>
                <Text style={styles.text}>Map View (Preview)</Text>
                <Text style={styles.subtext}>Interactive maps are currently disabled for stability.</Text>
            </View>
            {/* Mock Markers */}
            <View style={[styles.marker, { top: '30%', left: '40%' }]} />
            <View style={[styles.marker, { top: '50%', left: '60%' }]} />
            <View style={[styles.marker, { top: '70%', left: '30%' }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e2e8f0',
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    line: {
        width: '20%',
        height: 100,
        borderWidth: 0.5,
        borderColor: '#cbd5e1',
    },
    overlay: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtext: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
        textAlign: 'center',
    },
    marker: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderRadius: 10,
        backgroundColor: '#7c3aed',
        borderWidth: 2,
        borderColor: '#fff',
    }
});

export default MockMap;
