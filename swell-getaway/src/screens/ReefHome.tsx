import React from 'react';
import {
    Image,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import BeachScene from '../ui/BeachScene';

const beachBg = require('../../assets/getaway/beach-bg.jpg');
const crabImg = require('../../assets/getaway/crab.png');

type Props = {
  focus: import('../state/getawayLogic').Focus;
  onChangeFocus: (f: import('../state/getawayLogic').Focus) => void;
  levelLabel: string;
  totalXp: number;
  totalShells: number;
  unlocks: string[];
  cucumbersAvailable: number;
  onCollectCucumber: () => void;
  crabLine: string;
  onOpenCoach: () => void;
};

const ReefHome: React.FC<Props> = ({
  focus,
  onChangeFocus,
  levelLabel,
  totalXp,
  totalShells,
  unlocks,
  cucumbersAvailable,
  onCollectCucumber,
  crabLine,
  onOpenCoach,
}) => {
  return (
    <ImageBackground
      source={beachBg}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay}>
        {/* top title that feels human & fades mentally (no giant chrome) */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Swell Getaway</Text>
          <Text style={styles.subtitle}>
            A quiet reef that only grows when you do.
          </Text>
          <Text style={styles.meta}>
            Lv {levelLabel} · {totalXp} XP · {totalShells} 🐚
          </Text>
        </View>

        {/* reef preview (compact) */}
        <View style={styles.sceneWrap}>
          <BeachScene
            unlocks={unlocks}
            levelLabel={levelLabel}
            totalShells={totalShells}
            compact
            cucumbersAvailable={cucumbersAvailable}
            onCollectCucumber={onCollectCucumber}
          />
        </View>

        {/* hermit crab coach on the sand */}
        <Pressable
          onPress={onOpenCoach}
          style={styles.crabRow}
        >
          <View style={styles.crabBubble}>
            <Text style={styles.crabText} numberOfLines={2}>
              {crabLine}
            </Text>
            <Text style={styles.crabHint}>
              Tap to open your coach space.
            </Text>
          </View>
          <Image source={crabImg} style={styles.crab} />
        </Pressable>

        {/* quick focus toggle pills */}
        <View style={styles.focusRow}>
          {(['relationships', 'stress', 'performance'] as const).map(f => (
            <Pressable
              key={f}
              onPress={() => onChangeFocus(f)}
              style={[
                styles.focusPill,
                focus === f && styles.focusPillActive,
              ]}
            >
              <Text
                style={[
                  styles.focusPillText,
                  focus === f && styles.focusPillTextActive,
                ]}
              >
                {f === 'relationships'
                  ? 'Relate'
                  : f === 'stress'
                  ? 'Steady'
                  : 'Perform'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImage: { resizeMode: 'cover' },
  overlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 56, // leave room for tabs overlay
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  titleWrap: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  subtitle: {
    fontSize: 11,
    color: '#E5E7EB',
    marginTop: 2,
  },
  meta: {
    fontSize: 10,
    color: '#BFDBFE',
    marginTop: 2,
  },
  sceneWrap: {
    marginBottom: 10,
  },
  crabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  crabBubble: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 230,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.96)',
    marginRight: 6,
  },
  crabText: {
    fontSize: 10,
    color: '#F9FAFB',
  },
  crabHint: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 2,
  },
  crab: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  focusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248,250,252,0.35)',
    marginRight: 6,
    marginTop: 4,
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  focusPillActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  focusPillText: {
    fontSize: 9,
    color: '#E5E7EB',
  },
  focusPillTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
});

export default ReefHome;
