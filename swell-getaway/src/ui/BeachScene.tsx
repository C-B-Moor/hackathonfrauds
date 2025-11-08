import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type BeachSceneProps = {
  unlocks: string[];
  levelLabel: string;
  totalShells: number;
  compact?: boolean;
  cucumbersAvailable?: number;
  onCollectCucumber?: () => void;
};

const BeachScene: React.FC<BeachSceneProps> = ({
  unlocks,
  levelLabel,
  totalShells,
  compact = true,
  cucumbersAvailable,
  onCollectCucumber,
}) => {
  const hasTowel = unlocks.includes('towel');
  const hasPalms = unlocks.includes('palms');
  const hasDock = unlocks.includes('dock');
  const hasLighthouse = unlocks.includes('lighthouse');

  const height = compact ? 180 : 260;
  const radius = compact ? 22 : 26;

  return (
    <View style={[styles.wrapper, { height, borderRadius: radius }]}>
      {/* labels */}
      <View style={styles.levelPill}>
        <Text style={styles.levelText}>{levelLabel}</Text>
      </View>
      <View style={styles.shellPill}>
        <Text style={styles.shellText}>🐚 {totalShells}</Text>
      </View>

      {/* sky + sea + sand */}
      <View style={styles.sky} />
      <View style={styles.sea} />
      <View style={styles.sand} />

      {/* simple “unlocks” using emojis for now */}
      {hasPalms && <Text style={styles.palms}>🌴</Text>}
      {hasDock && <Text style={styles.dock}>🛶</Text>}
      {hasTowel && <Text style={styles.towel}>🏖️</Text>}
      {hasLighthouse && <Text style={styles.lighthouse}>🗼</Text>}

      {/* cucumbers to collect */}
      {!!cucumbersAvailable &&
        cucumbersAvailable > 0 &&
        onCollectCucumber && (
          <Pressable
            onPress={onCollectCucumber}
            style={styles.cucumberBadge}
          >
            <Text style={styles.cucumberText}>
              🥒 x{cucumbersAvailable} · tap to collect
            </Text>
          </Pressable>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#A5D8FF',
    marginBottom: 8,
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#9ED5FF',
  },
  sea: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: '#1E88E5',
  },
  sand: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#FFE0B2',
  },
  levelPill: {
    position: 'absolute',
    top: 8,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 10,
  },
  levelText: {
    fontSize: 10,
    color: '#F5F5F5',
  },
  shellPill: {
    position: 'absolute',
    top: 8,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 10,
  },
  shellText: {
    fontSize: 10,
    color: '#3F3D3D',
  },
  palms: {
    position: 'absolute',
    bottom: '22%',
    left: 18,
    fontSize: 24,
  },
  dock: {
    position: 'absolute',
    bottom: '22%',
    right: 26,
    fontSize: 22,
  },
  towel: {
    position: 'absolute',
    bottom: '8%',
    left: 60,
    fontSize: 22,
  },
  lighthouse: {
    position: 'absolute',
    top: '20%',
    right: 16,
    fontSize: 22,
  },
  cucumberBadge: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cucumberText: {
    fontSize: 9,
    color: '#F5F5F5',
  },
});

export default BeachScene;
