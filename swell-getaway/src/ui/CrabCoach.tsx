import React from 'react';
import {
  Alert,
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
};

const CrabCoach: React.FC<CrabCoachProps> = ({
  totalXp,
  streak,
  focus,
  totalShells,
}) => {
  const line = getLine(totalXp, streak, focus, totalShells);

  const handlePress = () => {
    const suggestion =
      focus === 'stress'
        ? 'Pick one moment that usually spikes your stress and decide how you want to meet it today.'
        : focus === 'performance'
        ? 'Choose one task that actually matters and give it five more seconds of attention than you usually would.'
        : 'Think of one person who deserves a softer version of you tonight and plan that message now.';
    Alert.alert('Riff’s quick idea', suggestion);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconBubble}>
        <Text style={styles.crabIcon}>🦀</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.name}>Riff</Text>
        <Text style={styles.role}>shoreline guide</Text>
        <Text style={styles.message}>{line}</Text>
        <TouchableOpacity style={styles.chip} onPress={handlePress}>
          <Text style={styles.chipText}>Give me one small move</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function getLine(
  totalXp: number,
  streak: number,
  focus: Focus,
  shells: number
): string {
  if (streak >= 5) {
    return `You keep showing up. Let’s use that for one conversation or moment that actually counts today.`;
  }
  if (totalXp === 0) {
    return 'Start with one honest rep. I will remember it, even if no one else sees it.';
  }
  if (totalXp < 60) {
    return 'You have started. Choose one mission that feels doable and lock in one real moment.';
  }
  if (shells >= 15 && totalXp > 120) {
    return 'These shells are proof you are practicing, not just thinking about it. Let’s keep it grounded.';
  }
  if (focus === 'stress') {
    return 'You are learning to stay steady when it is loud. Pick one spike to practice on today.';
  }
  if (focus === 'performance') {
    return 'Your effort is real. Aim it at one thing that moves your week, not just your inbox.';
  }
  return 'You care about your people. Choose one interaction to handle with a little more honesty and care.';
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#264B7A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  crabIcon: {
    fontSize: 22,
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
