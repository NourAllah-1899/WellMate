import { useTheme } from '../../context/ThemeContext';

const MockMap = () => {
    const { isDarkMode } = useTheme();
    const isLight = !isDarkMode;
    return (
        <View style={[styles.container, isLight && styles.containerLight]}>
            <View style={styles.grid}>
                {[...Array(20)].map((_, i) => (
                    <View key={i} style={[styles.line, isLight && styles.lineLight]} />
                ))}
            </View>
            <View style={[styles.overlay, isLight && styles.overlayLight]}>
                <Text style={[styles.text, isLight && styles.textLight]}>Map View (Preview)</Text>
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
        backgroundColor: '#0f172a',
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerLight: {
        backgroundColor: '#f1f5f9',
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
        borderColor: '#1e293b',
    },
    lineLight: {
        borderColor: '#cbd5e1',
    },
    overlay: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    overlayLight: {
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    textLight: {
        color: '#1e293b',
    },
    subtext: {
        fontSize: 12,
        color: '#94a3b8',
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
