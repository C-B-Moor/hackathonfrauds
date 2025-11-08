import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Focus } from '../state/getawayLogic';

type CrabCoachProps = {
  totalXp: number;
  streak: number;
  focus: Focus;
  totalShells: number;
  onOpenCrab?: () => void;
};

const CrabCoach: React.FC<CrabCoachProps> = ({
  totalXp,
  streak,
  focus,
  totalShells,
  onOpenCrab,
}) => {
  const line = getLine(totalXp, streak, focus, totalShells);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onOpenCrab}
    >
      <View style={styles.iconBubble}>
        <View style={styles.crabBody}>
          <View style={styles.crabEye} />
          <View style={styles.crabEye} />
        </View>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.name}>Riff</Text>
        <Text style={styles.role}>coach on call</Text>
        <Text style={styles.message}>{line}</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Open coaching space</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function getLine(
  totalXp: number,
  streak: number,
  focus: Focus,
  shells: number
): string {
  if (streak >= 5) {
    return 'You keep showing up. Choose one moment today that deserves that same care.';
  }
  if (totalXp === 0) {
    return 'Start small. One real attempt is enough for today.';
  }
  if (totalXp < 60) {
    return 'You’ve started. Let’s anchor it to one situation you actually care about.';
  }
  if (shells >= 15 && totalXp > 120) {
    return 'These reps are proof you’re already changing, not starting from scratch.';
  }
  if (focus === 'stress') {
    return 'Pick one predictable spike and decide how you want to meet it.';
  }
  if (focus === 'performance') {
    return 'Protect a small block of focus time for what actually matters to you.';
  }
  return 'Choose one interaction today to handle with more honesty and care.';
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0F1F33',
    padding: 10,
    borderRadius: 18,
    marginTop: 4,
    marginBottom: 10,
    alignItems: 'center',
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#203956',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  crabBody: {
    width: 22,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#E5754A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  crabEye: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#F5F5F5',
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 11,
    color: '#F5F2EC',
    fontWeight: '600',
  },
  role: {
    fontSize: 9,
    color: '#9FB3CF',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#E7F0FA',
    marginBottom: 6,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#496B94',
  },
  chipText: {
    fontSize: 10,
    color: '#D2E4FF',
  },
});

export default CrabCoach;
