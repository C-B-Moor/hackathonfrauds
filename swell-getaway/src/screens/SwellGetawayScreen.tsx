import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DailyMission,
  Focus,
  generateDailyPrompt,
  getDailyMissions,
  getLevelMeta,
  getTodayId,
  getUnlocks,
} from '../state/getawayLogic';
import BeachScene from '../ui/BeachScene';
import CrabCoach from '../ui/CrabCoach';

type Entry = {
  id: string;
  date: string;
  focus: Focus;
  missionId: string;
  xp: number;
  shells: number;
  reflection?: string;
};

const focusOptions: Focus[] = ['relationships', 'stress', 'performance'];

const milestoneConfig = [
  { xp: 50, label: 'Towel and shade' },
  { xp: 120, label: 'Dock on the water' },
  { xp: 220, label: 'Palms and quiet cove' },
  { xp: 360, label: 'Lighthouse marker' },
  { xp: 520, label: 'Night fire and reef' },
];

const SwellGetawayScreen: React.FC = () => {
  const [focus, setFocus] = useState<Focus>('relationships');
  const [totalXp, setTotalXp] = useState<number>(60); // demo seed
  const [totalShells, setTotalShells] = useState<number>(6); // demo seed
  const [entries, setEntries] = useState<Entry[]>([]);

  const [reflectionMission, setReflectionMission] = useState<DailyMission | null>(null);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [showReflection, setShowReflection] = useState<boolean>(false);

  const [showBeachZoom, setShowBeachZoom] = useState<boolean>(false);

  const [justLeveled, setJustLeveled] = useState<boolean>(false);
  const levelBannerOpacity = useRef(new Animated.Value(0)).current;
  const lastLevelRef = useRef<number>(0);

  const todayId = getTodayId();

  const missions = useMemo(
    () => getDailyMissions(focus, todayId),
    [focus, todayId]
  );

  const completedMissionIds = useMemo(
    () =>
      new Set(
        entries
          .filter((e) => e.date === todayId && !!e.missionId)
          .map((e) => e.missionId)
      ),
    [entries, todayId]
  );

  const todayPrompt = useMemo(
    () => generateDailyPrompt(focus, todayId),
    [focus, todayId]
  );

  const levelMeta = useMemo(
    () => getLevelMeta(totalXp),
    [totalXp]
  );

  const unlocks = useMemo(
    () => getUnlocks(totalXp, totalShells),
    [totalXp, totalShells]
  );

  const streak = useMemo(
    () => computeStreak(entries),
    [entries]
  );

  // Level-up banner
  useEffect(() => {
    if (levelMeta.level > lastLevelRef.current) {
      lastLevelRef.current = levelMeta.level;
      setJustLeveled(true);

      levelBannerOpacity.setValue(0);
      Animated.timing(levelBannerOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(levelBannerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setJustLeveled(false));
        }, 1400);
      });
    }
  }, [levelMeta.level, levelBannerOpacity]);

  // Mission handling

  const startMission = (mission: DailyMission) => {
    if (completedMissionIds.has(mission.id)) return;

    if (mission.requiresReflection) {
      setReflectionMission(mission);
      setReflectionText('');
      setShowReflection(true);
      return;
    }

    applyMissionReward(mission, '');
  };

  const applyMissionReward = (mission: DailyMission, note: string) => {
    if (completedMissionIds.has(mission.id)) return;

    const entry: Entry = {
      id: `${todayId}-${mission.id}`,
      date: todayId,
      focus,
      missionId: mission.id,
      xp: mission.xp,
      shells: mission.rewardShells,
      reflection: note || undefined,
    };

    setEntries((prev) => [entry, ...prev]);
    setTotalXp((prev) => prev + mission.xp);
    setTotalShells((prev) => prev + mission.rewardShells);
  };

  const confirmReflection = () => {
    if (!reflectionMission) return;
    applyMissionReward(reflectionMission, reflectionText.trim());
    setShowReflection(false);
    setReflectionMission(null);
    setReflectionText('');
  };

  const cancelReflection = () => {
    setShowReflection(false);
    setReflectionMission(null);
    setReflectionText('');
  };

  const renderMission = (mission: DailyMission) => {
    const done = completedMissionIds.has(mission.id);
    const tierLabel =
      mission.tier === 'easy'
        ? 'Low friction'
        : mission.tier === 'core'
        ? 'Core rep'
        : 'Stretch';

    return (
      <TouchableOpacity
        key={mission.id}
        style={[styles.missionCard, done && styles.missionDone]}
        onPress={() => startMission(mission)}
        activeOpacity={0.9}
      >
        <View style={styles.missionLeft}>
          <Text style={styles.missionTier}>{tierLabel}</Text>
          <Text style={styles.missionLabel} numberOfLines={2}>
            {mission.label}
          </Text>
          <Text style={styles.missionXp}>
            +{mission.xp} XP • +{mission.rewardShells}🐚
          </Text>
        </View>
        <View style={styles.missionStatusBubble}>
          <Text style={styles.missionStatusText}>
            {done ? '✓ Done' : 'Tap to claim'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const missionsCompletedCount = missions.filter((m) =>
    completedMissionIds.has(m.id)
  ).length;

  const handleMilestonePress = (xp: number, label: string) => {
    if (totalXp >= xp) {
      Alert.alert('Unlocked', `${label} is already part of your beach experience.`);
    } else {
      const remaining = xp - totalXp;
      Alert.alert(
        'Not yet',
        `Earn ${remaining} more XP to unlock ${label}.`
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Swell Getaway</Text>
        <View style={styles.levelTag}>
          <Text style={styles.levelTagText}>
            Lv {levelMeta.level}  ·  {totalXp} XP
          </Text>
        </View>
      </View>

      <View style={styles.headerMetricsRow}>
        <Text style={styles.headerMetric}>
          {missionsCompletedCount}/{missions.length} today
        </Text>
        <Text style={styles.headerMetric}>
          {streak > 0 ? `${streak}-day streak` : 'Streak ready'}
        </Text>
      </View>

      <Text style={styles.subtitle}>
        One small rep at a time. Your space here grows with you.
      </Text>

      {justLeveled && (
        <Animated.View
          style={[styles.levelUpBanner, { opacity: levelBannerOpacity }]}
        >
          <Text style={styles.levelUpText}>
            New level reached: {levelMeta.label}
          </Text>
        </Animated.View>
      )}

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Focus selector */}
        <View style={styles.focusRow}>
          {focusOptions.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.focusChip,
                focus === f && styles.focusChipActive,
              ]}
              onPress={() => setFocus(f)}
            >
              <Text
                style={[
                  styles.focusChipText,
                  focus === f && styles.focusChipTextActive,
                ]}
              >
                {labelForFocus(f)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Beach + progress */}
        <View style={styles.row}>
          <TouchableOpacity
            style={{ flex: 3 }}
            activeOpacity={0.9}
            onPress={() => setShowBeachZoom(true)}
          >
            <BeachScene
              unlocks={unlocks}
              levelLabel={levelMeta.label}
              totalShells={totalShells}
              compact
            />
          </TouchableOpacity>
          <View style={styles.progressColumn}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${levelMeta.progress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(levelMeta.progress * 100)}% to next level
            </Text>
            <Text style={styles.streakText}>
              {streak > 0 ? `${streak}-day streak` : 'Begin with one honest rep'}
            </Text>
          </View>
        </View>

        {/* Crab coach */}
        <CrabCoach
          totalXp={totalXp}
          streak={streak}
          focus={focus}
          totalShells={totalShells}
        />

        {/* Today prompt */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today’s tiny rep</Text>
          <Text style={styles.cardPrompt}>{todayPrompt.text}</Text>
        </View>

        {/* Next unlocks */}
        <Text style={styles.sectionLabel}>Next unlocks</Text>
        <View style={styles.milestoneRow}>
          {milestoneConfig.map((m) => {
            const done = totalXp >= m.xp;
            return (
              <TouchableOpacity
                key={m.xp}
                style={[
                  styles.milestonePill,
                  done && styles.milestonePillDone,
                ]}
                onPress={() => handleMilestonePress(m.xp, m.label)}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.milestoneLabel,
                    done && styles.milestoneLabelDone,
                  ]}
                >
                  {m.xp} XP
                </Text>
                <Text
                  style={[
                    styles.milestoneText,
                    done && styles.milestoneLabelDone,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Missions */}
        <Text style={styles.sectionLabel}>Today’s missions</Text>
        <View style={styles.missionsWrap}>
          {missions.map(renderMission)}
        </View>

        {/* Recent progress */}
        <Text style={styles.sectionLabel}>Recent progress</Text>
        {entries.length === 0 ? (
          <Text style={styles.historyEmpty}>
            Your next real moment will land here.
          </Text>
        ) : (
          entries.map((item) => (
            <Text key={item.id} style={styles.historyItem}>
              {item.date} · {labelForFocus(item.focus)} · +{item.xp} XP · +
              {item.shells}🐚
              {item.reflection ? `  “${item.reflection}”` : ''}
            </Text>
          ))
        )}
      </ScrollView>

      {/* Beach zoom modal */}
      <Modal
        visible={showBeachZoom}
        transparent
        animationType="fade"
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowBeachZoom(false)}
        />
        <View style={styles.beachZoomCard}>
          <BeachScene
            unlocks={unlocks}
            levelLabel={levelMeta.label}
            totalShells={totalShells}
            compact={false}
          />
          <Text style={styles.beachZoomText}>
            This is your current shoreline. Every unlocked detail comes from real effort.
          </Text>
        </View>
      </Modal>

      {/* Reflection modal */}
      <Modal
        visible={showReflection}
        transparent
        animationType="fade"
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={cancelReflection}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log your rep</Text>
            <Text style={styles.modalSubtitle}>
              One clear sentence about what you tried or how it went.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="For example: Stayed calm when briefing my team after a long shift."
              placeholderTextColor="#9BA8B3"
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={cancelReflection}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={confirmReflection}
              >
                <Text style={styles.modalPrimaryText}>Save and claim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// Helpers

function computeStreak(entries: Entry[]): number {
  if (!entries.length) return 0;

  const dates = Array.from(new Set(entries.map((e) => e.date))).sort();
  let streak = 0;
  let cursor = getTodayId();

  while (dates.includes(cursor)) {
    streak++;
    const d = new Date(cursor);
    d.setDate(d.getDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }

  return streak;
}

function labelForFocus(f: Focus): string {
  if (f === 'relationships') return 'Relationships';
  if (f === 'stress') return 'Stress';
  return 'Performance';
}

// Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 26,
    backgroundColor: '#F5F2EC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#12263A',
  },
  levelTag: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#123B5D',
  },
  levelTagText: {
    fontSize: 10,
    color: '#F5F2EC',
  },
  headerMetricsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  headerMetric: {
    fontSize: 10,
    color: '#8C9BAA',
    marginRight: 12,
  },
  subtitle: {
    fontSize: 12,
    color: '#5B6E83',
    marginBottom: 6,
  },
  levelUpBanner: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#123B5D',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  levelUpText: {
    fontSize: 11,
    color: '#F5F2EC',
    fontWeight: '500',
  },
  focusRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  focusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D2D8DE',
    marginRight: 6,
  },
  focusChipActive: {
    backgroundColor: '#123B5D',
    borderColor: '#123B5D',
  },
  focusChipText: {
    fontSize: 11,
    color: '#5B6E83',
  },
  focusChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 4,
  },
  progressColumn: {
    flex: 2,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 7,
    borderRadius: 999,
    backgroundColor: '#E0E4EA',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2C6BAA',
  },
  progressText: {
    fontSize: 10,
    color: '#5B6E83',
  },
  streakText: {
    fontSize: 10,
    color: '#8C9BAA',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginTop: 4,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 10,
    color: '#9BA8B3',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  cardPrompt: {
    fontSize: 14,
    color: '#12263A',
  },
  sectionLabel: {
    fontSize: 10,
    color: '#9BA8B3',
    marginTop: 6,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  milestoneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  milestonePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E4EA',
    marginRight: 6,
    marginBottom: 4,
  },
  milestonePillDone: {
    backgroundColor: '#123B5D',
    borderColor: '#123B5D',
  },
  milestoneLabel: {
    fontSize: 9,
    color: '#8C9BAA',
  },
  milestoneLabelDone: {
    color: '#FFFFFF',
  },
  milestoneText: {
    fontSize: 9,
    color: '#5B6E83',
  },
  missionsWrap: {
    marginBottom: 4,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  missionDone: {
    backgroundColor: '#E3F4E8',
    borderColor: '#8AC79A',
    borderWidth: 1,
  },
  missionLeft: {
    flex: 1,
  },
  missionTier: {
    fontSize: 9,
    color: '#9BA8B3',
    textTransform: 'uppercase',
  },
  missionLabel: {
    fontSize: 12,
    color: '#12263A',
    marginBottom: 2,
  },
  missionXp: {
    fontSize: 10,
    color: '#4D8AC0',
  },
  missionStatusBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F0F3F7',
  },
  missionStatusText: {
    fontSize: 9,
    color: '#5B6E83',
  },
  historyItem: {
    fontSize: 11,
    color: '#5B6E83',
    marginBottom: 2,
  },
  historyEmpty: {
    fontSize: 11,
    color: '#B0B8C2',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#12263A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#5B6E83',
    marginBottom: 8,
  },
  modalInput: {
    minHeight: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D2D8DE',
    padding: 8,
    fontSize: 12,
    color: '#12263A',
    marginBottom: 10,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 6,
  },
  modalSecondaryText: {
    fontSize: 11,
    color: '#8C9BAA',
  },
  modalPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#123B5D',
  },
  modalPrimaryText: {
    fontSize: 11,
    color: '#F5F2EC',
    fontWeight: '500',
  },
  beachZoomCard: {
    marginHorizontal: 18,
    marginTop: 90,
    marginBottom: 40,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F2EC',
    paddingBottom: 10,
  },
  beachZoomText: {
    fontSize: 11,
    color: '#4D5B6A',
    paddingHorizontal: 10,
    paddingTop: 6,
  },
});

export default SwellGetawayScreen;
