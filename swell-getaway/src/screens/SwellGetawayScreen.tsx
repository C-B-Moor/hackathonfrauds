import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  ImageBackground,
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
import ReefHome from './ReefHome';

const beachBg = require('../../assets/getaway/beach-bg.jpg');
const crabImg = require('../../assets/getaway/crab.png');

// If you're on a real device, replace localhost with your computer's IP.
// Example: 'http://192.168.1.50:4000'
const API_BASE = 'http://10.2.64.5:4000';

async function getAiScoreForMission(
  mission: DailyMission,
  reflection: string,
  currentXp: number,
  streak: number
): Promise<{ xp: number; note?: string }> {
  try {
    const res = await fetch(`${API_BASE}/score-mission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        missionText: mission.label,
        reflection,
        currentXp,
        streak,
        tier: mission.tier,
      }),
    });

    if (!res.ok) throw new Error('Bad response from scorer');
    const data = await res.json();

    const xp =
      typeof data.xp === 'number'
        ? Math.max(10, Math.min(60, data.xp)) // clamp 10–60
        : 20;

    return { xp, note: data.note };
  } catch (e) {
    // Fallback if AI is down or network fails
        const fallback = 10;
        return { xp: fallback };

  }
}



type Entry = {
  id: string;
  date: string;
  focus: Focus;
  missionId: string;
  xp: number;
  shells: number;
  reflection?: string;
};

type LocalTab = 'home' | 'missions' | 'profile' | 'unlocks';

const milestoneConfig = [
  { xp: 50, label: 'Shaded towel spot 🏖️' },
  { xp: 120, label: 'Wooden dock into the bay 🛶' },
  { xp: 220, label: 'Palm cluster + hammock 🌴' },
  { xp: 360, label: 'Soft-lit lighthouse 🗼' },
  { xp: 520, label: 'Glowing reef at night 🪸' },
];

const focusLabel = (f: Focus): string =>
  f === 'relationships'
    ? 'Relationships'
    : f === 'stress'
    ? 'Stress'
    : 'Performance';

const SwellGetawayScreen: React.FC = () => {
  const [focus, setFocus] = useState<Focus>('relationships');
  const [tab, setTab] = useState<LocalTab>('home');

  const [totalXp, setTotalXp] = useState<number>(60);
  const [totalShells, setTotalShells] = useState<number>(6);
  const [entries, setEntries] = useState<Entry[]>([]);

  const [reflectionMission, setReflectionMission] =
    useState<DailyMission | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  const [showCoach, setShowCoach] = useState(false);
  const [showReefZoom, setShowReefZoom] = useState(false);

  const [justLeveled, setJustLeveled] = useState(false);

  // demo: cucumbers to collect
  const [cucumbersAvailable, setCucumbersAvailable] =
    useState<number>(2);

  const levelBannerOpacity = useRef(
    new Animated.Value(0)
  ).current;
  const lastLevelRef = useRef<number>(0);

  const todayId = getTodayId();

  // missions depend on focus
  const missions = useMemo(
    () => getDailyMissions(focus, todayId),
    [focus, todayId]
  );

  const completedMissionIds = useMemo(
    () =>
      new Set(
        entries
          .filter((e) => e.date === todayId)
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

  const weekDays = useMemo(
    () => buildStreakWeek(entries, todayId),
    [entries, todayId]
  );

  // level-up toast
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

  // ----- mission handlers -----

const startMission = async (mission: DailyMission) => {
  if (completedMissionIds.has(mission.id)) return;

  if (mission.requiresReflection) {
    setReflectionMission(mission);
    setReflectionText('');
    setShowReflection(true);
    return;
  }

  await applyMissionReward(mission, '');
};

const applyMissionReward = async (
  mission: DailyMission,
  note: string
) => {
  if (completedMissionIds.has(mission.id)) return;

  // 1. Ask AI/backend for XP
  const { xp, note: aiNote } =
    await getAiScoreForMission(
      mission,
      note,
      totalXp,
      streak
    );

  // 2. Derive shells from XP (tunable)
  const shells =
    xp >= 50
      ? 4
      : xp >= 35
      ? 3
      : xp >= 20
      ? 2
      : 1;

  // 3. Save entry
  const entry: Entry = {
    id: `${todayId}-${mission.id}`,
    date: todayId,
    missionId: mission.id,
    xp,
    shells,
    reflection: note || aiNote || undefined,
  };

  setEntries(prev => [entry, ...prev]);
  setTotalXp(prev => prev + xp);
  setTotalShells(prev => prev + shells);
};
const confirmReflection = async () => {
  if (!reflectionMission) return;
  const trimmed = reflectionText.trim();
  await applyMissionReward(reflectionMission, trimmed);
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
      ? 'Core'
      : 'Stretch';

  const loggedEntry = entries.find(
    (e) => e.date === todayId && e.missionId === mission.id
  );

  return (
    <TouchableOpacity
      key={mission.id}
      style={[
        styles.missionCard,
        done && styles.missionDone,
      ]}
      onPress={() => startMission(mission)}
      activeOpacity={0.92}
    >
      <View style={styles.missionLeft}>
        <Text style={styles.missionTier}>{tierLabel}</Text>
        <Text
          style={styles.missionLabel}
          numberOfLines={2}
        >
          {mission.label}
        </Text>
        <Text style={styles.missionXp}>
          {loggedEntry
            ? `+${loggedEntry.xp} XP · +${loggedEntry.shells} shells`
            : 'AI-scored XP · effort-based shells'}
        </Text>
      </View>
      <View style={styles.missionStatusBubble}>
        <Text style={styles.missionStatusText}>
          {done ? 'Logged' : 'Tap to log'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


  const missionsCompletedCount = missions.filter(
    (m) => completedMissionIds.has(m.id)
  ).length;

  const handleMilestonePress = (
    xp: number,
    label: string
  ) => {
    if (totalXp >= xp) return;
    const remaining = xp - totalXp;
    alert(
      `You’re ${remaining} XP away from ${label}.`
    );
  };

  const crabLine = getCrabLine(
    totalXp,
    streak,
    focus
  );

  const handleCollectCucumber = () => {
    if (cucumbersAvailable <= 0) return;
    setCucumbersAvailable((n) => n - 1);
    setTotalShells((s) => s + 1);
  };

  // ----- HOME TAB: ReefHome owns vertical swipe + hero crab -----

  if (tab === 'home') {
    return (
      <View style={{ flex: 1 }}>
        <ReefHome
          focus={focus}
          onChangeFocus={setFocus}
          levelLabel={levelMeta.label}
          totalXp={totalXp}
          totalShells={totalShells}
          unlocks={unlocks}
          cucumbersAvailable={cucumbersAvailable}
          onCollectCucumber={handleCollectCucumber}
          crabLine={crabLine}
          onOpenCoach={() => setShowCoach(true)}
        />

        <View style={styles.tabsRow}>
          <TabButton
            label="Reef"
            icon="🏝️"
            active
            onPress={() => setTab('home')}
          />
          <TabButton
            label="Missions"
            icon="📋"
            active={false}
            onPress={() => setTab('missions')}
          />
          <TabButton
            label="Profile"
            icon="👤"
            active={false}
            onPress={() => setTab('profile')}
          />
          <TabButton
            label="Unlocks"
            icon="🪸"
            active={false}
            onPress={() => setTab('unlocks')}
          />
        </View>

        <CoachModal
          visible={showCoach}
          onClose={() => setShowCoach(false)}
        />

        <ReflectionModal
          visible={showReflection}
          reflectionText={reflectionText}
          setReflectionText={setReflectionText}
          onCancel={cancelReflection}
          onSave={confirmReflection}
        />

        <Modal
          visible={showReefZoom}
          transparent
          animationType="fade"
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() =>
              setShowReefZoom(false)
            }
          />
          <View style={styles.beachZoomCard}>
            <BeachScene
              unlocks={unlocks}
              levelLabel={levelMeta.label}
              totalShells={totalShells}
              cucumbersAvailable={
                cucumbersAvailable
              }
              onCollectCucumber={
                handleCollectCucumber
              }
              compact={false}
            />
          </View>
        </Modal>
      </View>
    );
  }

  // ----- OTHER TABS: missions / profile / unlocks -----

  return (
    <ImageBackground
      source={beachBg}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay}>
        {/* summary */}
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryText}>
              {missionsCompletedCount}/
              {missions.length} missions
              today
            </Text>
            <Text style={styles.summaryText}>
              Streak:{' '}
              {streak > 0
                ? `${streak} days`
                : 'start anytime'}
            </Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillText}>
              Lv {levelMeta.level}
            </Text>
            <Text style={styles.summaryPillSub}>
              {totalXp} XP · {totalShells} 🐚
            </Text>
          </View>
        </View>

        {/* streak week */}
        <View style={styles.weekStrip}>
          {weekDays.map((d) => (
            <View
              key={d.date}
              style={[
                styles.dayCell,
                d.isToday && styles.dayToday,
              ]}
            >
              <Text style={styles.dayLabel}>
                {d.label}
              </Text>
              <Text
                style={[
                  styles.dayIcon,
                  d.hit && styles.dayIconHit,
                ]}
              >
                {d.hit ? '🪸' : '·'}
              </Text>
            </View>
          ))}
        </View>

        {/* level up toast */}
        {justLeveled && (
          <Animated.View
            style={[
              styles.levelUpBanner,
              {
                opacity:
                  levelBannerOpacity,
              },
            ]}
          >
            <Text style={styles.levelUpText}>
              New level reached:{' '}
              {levelMeta.label}
            </Text>
          </Animated.View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {tab === 'missions' && (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>
                  Focus
                </Text>
                <View
                  style={
                    styles.focusChipsRow
                  }
                >
                  {(['relationships',
                    'stress',
                    'performance'] as Focus[]).map(
                    (f) => (
                      <TouchableOpacity
                        key={f}
                        onPress={() =>
                          setFocus(f)
                        }
                        style={[
                          styles.focusChip,
                          focus === f &&
                            styles.focusChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.focusChipText,
                            focus ===
                              f &&
                              styles.focusChipTextActive,
                          ]}
                        >
                          {focusLabel(
                            f
                          )}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={styles.card}>
                <Text
                  style={
                    styles.cardLabel
                  }
                >
                  Today’s tiny rep
                </Text>
                <Text
                  style={
                    styles.cardPrompt
                  }
                >
                  {todayPrompt.text}
                </Text>
              </View>

              <Text
                style={
                  styles.sectionLabel
                }
              >
                Today’s missions
              </Text>
              {missions.map(
                renderMission
              )}
            </View>
          )}

          {tab === 'profile' &&
            renderProfile(
              entries,
              streak,
              levelMeta.level,
              totalXp,
              totalShells
            )}

          {tab === 'unlocks' &&
            renderUnlocks(
              milestoneConfig,
              totalXp,
              unlocks,
              handleMilestonePress
            )}
        </ScrollView>

        <View style={styles.tabsRow}>
          <TabButton
            label="Reef"
            icon="🏝️"
            active={tab === 'home'}
            onPress={() => setTab('home')}
          />
          <TabButton
            label="Missions"
            icon="📋"
            active={tab === 'missions'}
            onPress={() =>
              setTab('missions')
            }
          />
          <TabButton
            label="Profile"
            icon="👤"
            active={tab === 'profile'}
            onPress={() =>
              setTab('profile')
            }
          />
          <TabButton
            label="Unlocks"
            icon="🪸"
            active={tab === 'unlocks'}
            onPress={() =>
              setTab('unlocks')
            }
          />
        </View>

        <CoachModal
          visible={showCoach}
          onClose={() => setShowCoach(false)}
        />

        <ReflectionModal
          visible={showReflection}
          reflectionText={reflectionText}
          setReflectionText={setReflectionText}
          onCancel={cancelReflection}
          onSave={confirmReflection}
        />

        <Modal
          visible={showReefZoom}
          transparent
          animationType="fade"
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() =>
              setShowReefZoom(false)
            }
          />
          <View style={styles.beachZoomCard}>
            <BeachScene
              unlocks={unlocks}
              levelLabel={
                levelMeta.label
              }
              totalShells={
                totalShells
              }
              cucumbersAvailable={
                cucumbersAvailable
              }
              onCollectCucumber={
                handleCollectCucumber
              }
              compact={false}
            />
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

/* ------- Sub components ------- */

const TabButton = ({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    style={[
      styles.tabButton,
      active && styles.tabButtonActive,
    ]}
  >
    <Text style={styles.tabIcon}>
      {icon}
    </Text>
    <Text
      style={[
        styles.tabLabel,
        active && styles.tabLabelActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const CoachModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
  >
    <KeyboardAvoidingView
      style={styles.modalOverlay}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onClose}
      />
      <View style={styles.modalCard}>
        <View style={styles.modalCrabRow}>
          <Animated.Image
            source={crabImg}
            style={styles.modalCrab}
          />
          <View>
            <Text style={styles.modalTitle}>
              Reef Coach
            </Text>
            <Text
              style={
                styles.modalSubtitle
              }
            >
              In Swell, this opens the AI
              coach with your focus,
              streak, and reps as context.
            </Text>
          </View>
        </View>
        <TextInput
          style={styles.modalInput}
          placeholder="Type the situation or message you’d send."
          placeholderTextColor="#9BA8B3"
          multiline
        />
        <View
          style={styles.modalButtonsRow}
        >
          <TouchableOpacity
            style={
              styles.modalSecondary
            }
            onPress={onClose}
          >
            <Text
              style={
                styles.modalSecondaryText
              }
            >
              Close
            </Text>
          </TouchableOpacity>
          <View
            style={styles.modalPrimary}
          >
            <Text
              style={
                styles.modalPrimaryText
              }
            >
              Send (demo)
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const ReflectionModal = ({
  visible,
  reflectionText,
  setReflectionText,
  onCancel,
  onSave,
}: {
  visible: boolean;
  reflectionText: string;
  setReflectionText: (t: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
  >
    <KeyboardAvoidingView
      style={styles.modalOverlay}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onCancel}
      />
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>
          Log your rep
        </Text>
        <Text style={styles.modalSubtitle}>
          One honest line is enough.
        </Text>
        <TextInput
          style={styles.modalInput}
          placeholder="For example: Took a breath before answering instead of snapping."
          placeholderTextColor="#9BA8B3"
          value={reflectionText}
          onChangeText={setReflectionText}
          multiline
        />
        <View
          style={styles.modalButtonsRow}
        >
          <TouchableOpacity
            style={
              styles.modalSecondary
            }
            onPress={onCancel}
          >
            <Text
              style={
                styles.modalSecondaryText
              }
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalPrimary}
            onPress={onSave}
          >
            <Text
              style={
                styles.modalPrimaryText
              }
            >
              Save &amp; claim
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

/* ------- helpers ------- */

function computeStreak(entries: Entry[]): number {
  if (!entries.length) return 0;
  const dates = Array.from(
    new Set(entries.map((e) => e.date))
  ).sort();
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

function computeLongestStreak(
  entries: Entry[]
): number {
  if (!entries.length) return 0;
  const unique = Array.from(
    new Set(entries.map((e) => e.date))
  ).sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const cur = new Date(unique[i]);
    prev.setDate(prev.getDate() + 1);
    if (
      prev.toISOString().slice(0, 10) ===
      unique[i]
    ) {
      current++;
      longest = Math.max(
        longest,
        current
      );
    } else {
      current = 1;
    }
  }
  return longest;
}

function buildStreakWeek(
  entries: Entry[],
  todayId: string
) {
  const hitDates = new Set(
    entries.map((e) => e.date)
  );
  const base = new Date(todayId);
  const out: {
    date: string;
    label: string;
    hit: boolean;
    isToday: boolean;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const iso = d
      .toISOString()
      .slice(0, 10);
    const weekday = d
      .toLocaleDateString('en-US', {
        weekday: 'short',
      })
      .charAt(0);
    out.push({
      date: iso,
      label: weekday,
      hit: hitDates.has(iso),
      isToday: iso === todayId,
    });
  }
  return out;
}

function getCrabLine(
  totalXp: number,
  streak: number,
  focus: Focus
): string {
  if (streak >= 5) {
    return 'You keep showing up. Let’s pick one situation worth doing on purpose.';
  }
  if (totalXp < 40) {
    return 'Welcome in. One honest rep is enough for today.';
  }
  if (focus === 'relationships') {
    return 'Choose one conversation to handle with more clarity or care.';
  }
  if (focus === 'stress') {
    return 'Notice one spike and give yourself a slow breath before you answer.';
  }
  if (focus === 'performance') {
    return 'Protect a small block for the work that actually matters.';
  }
  return 'Wherever you are tonight, we can turn one moment into practice.';
}

function renderProfile(
  entries: Entry[],
  streak: number,
  level: number,
  totalXp: number,
  totalShells: number
) {
  const longest = computeLongestStreak(entries);

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          You
        </Text>
        <Text style={styles.profileLine}>
          Level {level} · {totalXp} XP
        </Text>
        <Text style={styles.profileLine}>
          Shells banked: {totalShells}
        </Text>
        <Text style={styles.profileLine}>
          Current streak:{' '}
          {streak || 0} days
        </Text>
        <Text style={styles.profileLine}>
          Longest streak:{' '}
          {longest || 0} days
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          Recent reps
        </Text>
        {entries.length === 0 ? (
          <Text style={styles.historyEmpty}>
            Once you log a few missions,
            they’ll land here.
          </Text>
        ) : (
          entries
            .slice(0, 10)
            .map((e) => (
              <Text
                key={e.id}
                style={styles.historyItem}
              >
                {e.date} · +{e.xp}{' '}
                XP · +{e.shells} 🐚
                {e.reflection
                  ? ` — ${e.reflection}`
                  : ''}
              </Text>
            ))
        )}
      </View>
    </View>
  );
}

function renderUnlocks(
  milestones: {
    xp: number;
    label: string;
  }[],
  totalXp: number,
  unlocks: string[],
  onPress: (
    xp: number,
    label: string
  ) => void
) {
  const coralPieces =
    unlocks.filter((u) =>
      u.startsWith('coral')
    ).length;

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          Reef growth
        </Text>
        <Text style={styles.cardPrompt}>
          Each milestone adds new
          pieces to your shore and
          reef.
        </Text>
        <View style={styles.coralRowUnlock}>
          {Array.from({ length: 5 }).map(
            (_, i) => (
              <Text
                key={i}
                style={styles.coralIcon}
              >
                {i < coralPieces
                  ? '🪸'
                  : '·'}
              </Text>
            )
          )}
        </View>
      </View>

      <Text style={styles.sectionLabel}>
        Milestones
      </Text>
      {milestones.map((m) => {
        const done =
          totalXp >= m.xp;
        return (
          <TouchableOpacity
            key={m.xp}
            onPress={() =>
              onPress(m.xp, m.label)
            }
            activeOpacity={0.9}
            style={[
              styles.milestonePill,
              done &&
                styles.milestonePillDone,
            ]}
          >
            <Text
              style={[
                styles.milestoneLabel,
                done &&
                  styles.milestoneLabelDone,
              ]}
            >
              {m.xp} XP
            </Text>
            <Text
              style={[
                styles.milestoneText,
                done &&
                  styles.milestoneLabelDone,
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ------- styles ------- */

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImage: { resizeMode: 'cover' },
  overlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 10,
    color: '#E3EDF8',
  },
  summaryPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'flex-end',
  },
  summaryPillText: {
    fontSize: 11,
    color: '#F5F2EC',
    fontWeight: '600',
  },
  summaryPillSub: {
    fontSize: 9,
    color: '#D0DCEF',
  },
  weekStrip: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  dayCell: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  dayLabel: {
    fontSize: 8,
    color: '#C8D6EA',
    marginBottom: 1,
  },
  dayIcon: {
    fontSize: 10,
    color: '#7F8EA5',
  },
  dayIconHit: {
    color: '#FBE9A9',
  },
  dayToday: {
    borderBottomWidth: 1,
    borderColor: '#FBE9A9',
  },
  levelUpBanner: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(5,24,54,0.96)',
    marginBottom: 4,
  },
  levelUpText: {
    fontSize: 10,
    color: '#F5F2EC',
  },
  scrollContent: {
    paddingBottom: 70,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 18,
    padding: 12,
    marginBottom: 6,
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
    color: '#E0E7EF',
    marginTop: 4,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  focusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  focusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D3DCE6',
    marginRight: 6,
    marginBottom: 4,
  },
  focusChipActive: {
    backgroundColor: '#123B5D',
    borderColor: '#123B5D',
  },
  focusChipText: {
    fontSize: 10,
    color: '#64748B',
  },
  focusChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 5,
  },
  missionDone: {
    backgroundColor:
      'rgba(211,241,220,0.98)',
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
    color: '#4B5563',
    marginBottom: 2,
  },
  historyEmpty: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  profileLine: {
    fontSize: 12,
    color: '#111827',
    marginBottom: 2,
  },
  coralRowUnlock: {
    flexDirection: 'row',
    marginTop: 6,
  },
  coralIcon: {
    fontSize: 14,
    marginRight: 2,
    color: '#F97316',
  },
  milestonePill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.7)',
    marginBottom: 4,
    backgroundColor:
      'rgba(5,24,54,0.35)',
  },
  milestonePillDone: {
    backgroundColor:
      'rgba(5,24,54,0.96)',
    borderColor: '#FFFFFF',
  },
  milestoneLabel: {
    fontSize: 9,
    color: '#E0E7EF',
  },
  milestoneLabelDone: {
    color: '#FFFFFF',
  },
  milestoneText: {
    fontSize: 9,
    color: '#F5F2EC',
  },
  tabsRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor:
      'rgba(0,0,0,0.6)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  tabButtonActive: {
    backgroundColor:
      'rgba(255,255,255,0.12)',
    borderRadius: 14,
  },
  tabIcon: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  tabLabel: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  tabLabelActive: {
    color: '#F9FAFB',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(0,0,0,0.35)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
  },
  modalCrabRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  modalCrab: {
    width: 40,
    height: 40,
    marginRight: 8,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  modalInput: {
    minHeight: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D2D8DE',
    padding: 8,
    fontSize: 12,
    color: '#111827',
    marginTop: 10,
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
    color: '#6B7280',
  },
  modalPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  modalPrimaryText: {
    fontSize: 11,
    color: '#F9FAFB',
    fontWeight: '500',
  },
  beachZoomCard: {
    marginHorizontal: 18,
    marginTop: 90,
    marginBottom: 40,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F2EC',
  },
});

export default SwellGetawayScreen;
