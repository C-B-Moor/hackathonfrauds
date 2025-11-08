import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BeachSceneProps = {
  unlocks: string[];
  levelLabel: string;
  totalShells: number;
  compact?: boolean; // when false, used for zoomed-in view
};

const BeachScene: React.FC<BeachSceneProps> = ({
  unlocks,
  levelLabel,
  totalShells,
  compact = true,
}) => {
  const hasTowel = unlocks.includes('towel');
  const hasPalms = unlocks.includes('palms');
  const hasDock = unlocks.includes('dock');
  const hasLighthouse = unlocks.includes('lighthouse');
  const hasCoral = unlocks.includes('coral');
  const hasReef = unlocks.includes('reef');
  const hasFish = unlocks.includes('fish');
  const hasCampfire = unlocks.includes('campfire');

  const height = compact ? 170 : 320;
  const borderRadius = compact ? 24 : 26;

  return (
    <View style={[styles.wrapper, { height, borderRadius }]}>
      {/* Top labels */}
      <View style={styles.levelPill}>
        <Text style={styles.levelText}>{levelLabel}</Text>
      </View>
      <View style={styles.shellPill}>
        <Text style={styles.shellText}>🐚 {totalShells}</Text>
      </View>

      {/* Sky layers */}
      <View style={styles.skyBase} />
      <View style={styles.skySoft} />
      {/* Sun */}
      <View style={styles.sun} />
      {/* Clouds */}
      <Text style={styles.cloudLeft}>☁️</Text>
      <Text style={styles.cloudRight}>☁️</Text>

      {/* Sea bands for subtle texture */}
      <View style={styles.seaBand1} />
      <View style={styles.seaBand2} />
      <View style={styles.seaBand3} />

      {/* Sand with subtle "texture" bars */}
      <View style={styles.sandBase} />
      <View style={styles.sandBand1} />
      <View style={styles.sandBand2} />

      {/* Beach objects */}
      {hasPalms && <Text style={styles.palms}>🌴</Text>}
      {hasLighthouse && <Text style={styles.lighthouse}>🗼</Text>}
      {hasDock && <Text style={styles.dock}>🛶</Text>}
      {hasTowel && <Text style={styles.towel}>🏖️</Text>}
      {hasCampfire && <Text style={styles.campfire}>🔥</Text>}

      {/* Underwater life */}
      {(hasCoral || hasReef) && <Text style={styles.coral}>🪸</Text>}
      {hasReef && <Text style={styles.reef}>🪸</Text>}
      {hasFish && <Text style={styles.fish}>🐟</Text>}

      {/* Overlays */}
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E3E0DA',
    backgroundColor: '#BFD8F5',
    position: 'relative',
  },
  levelPill: {
    position: 'absolute',
    top: 8,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(8,33,61,0.9)',
    zIndex: 10,
  },
  levelText: {
    fontSize: 11,
    color: '#F6F3EE',
    fontWeight: '500',
  },
  shellPill: {
    position: 'absolute',
    top: 8,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(244,224,196,0.96)',
    zIndex: 10,
  },
  shellText: {
    fontSize: 11,
    color: '#5B3D25',
    fontWeight: '500',
  },
  skyBase: {
    position: 'absolute',
    top: 0,
    left: -16,
    right: -16,
    height: '45%',
    backgroundColor: '#C8DCF6',
  },
  skySoft: {
    position: 'absolute',
    top: '15%',
    left: -16,
    right: -16,
    height: '20%',
    backgroundColor: '#D6E3FA',
    opacity: 0.7,
  },
  sun: {
    position: 'absolute',
    top: 18,
    right: 40,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFE6A3',
  },
  cloudLeft: {
    position: 'absolute',
    top: 18,
    left: 24,
    fontSize: 16,
    opacity: 0.9,
  },
  cloudRight: {
    position: 'absolute',
    top: 32,
    right: 18,
    fontSize: 16,
    opacity: 0.9,
  },
  seaBand1: {
    position: 'absolute',
    top: '40%',
    left: -16,
    right: -16,
    height: '12%',
    backgroundColor: '#6FB7E9',
  },
  seaBand2: {
    position: 'absolute',
    top: '46%',
    left: -16,
    right: -16,
    height: '10%',
    backgroundColor: '#5CA7DD',
  },
  seaBand3: {
    position: 'absolute',
    top: '52%',
    left: -16,
    right: -16,
    height: '8%',
    backgroundColor: '#4E98CF',
    opacity: 0.9,
  },
  sandBase: {
    position: 'absolute',
    bottom: -4,
    left: -16,
    right: -16,
    height: '32%',
    backgroundColor: '#F4E0C4',
  },
  sandBand1: {
    position: 'absolute',
    bottom: '14%',
    left: -16,
    right: -16,
    height: 4,
    backgroundColor: 'rgba(214,189,151,0.45)',
  },
  sandBand2: {
    position: 'absolute',
    bottom: '6%',
    left: -16,
    right: -16,
    height: 3,
    backgroundColor: 'rgba(214,189,151,0.32)',
  },
  palms: {
    position: 'absolute',
    bottom: '26%',
    left: 18,
    fontSize: 26,
  },
  lighthouse: {
    position: 'absolute',
    top: '26%',
    right: 18,
    fontSize: 22,
  },
  dock: {
    position: 'absolute',
    top: '54%',
    left: 26,
    fontSize: 22,
  },
  towel: {
    position: 'absolute',
    bottom: '10%',
    left: 44,
    fontSize: 22,
  },
  campfire: {
    position: 'absolute',
    bottom: '9%',
    right: 60,
    fontSize: 20,
  },
  coral: {
    position: 'absolute',
    bottom: '4%',
    right: 26,
    fontSize: 20,
  },
  reef: {
    position: 'absolute',
    bottom: '8%',
    right: 44,
    fontSize: 18,
  },
  fish: {
    position: 'absolute',
    top: '50%',
    right: 52,
    fontSize: 18,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});

export default BeachScene;
