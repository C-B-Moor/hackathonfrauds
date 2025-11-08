import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    ImageBackground,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Focus } from '../state/getawayLogic';
import BeachScene from '../ui/BeachScene';

const beachBg = require('../../assets/getaway/beach-bg.jpg');
const crabImg = require('../../assets/getaway/crab.png');

type Props = {
  focus: Focus;
  onChangeFocus: (f: Focus) => void;
  levelLabel: string;
  totalXp: number;
  totalShells: number;
  unlocks: string[];
  cucumbersAvailable: number;
  onCollectCucumber: () => void;
  crabLine: string;
  onOpenCoach: () => void;
};

const PAGES = 3; // 1: surface/home, 2: reef, 3: castles

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
  const { height: H, width: W } = Dimensions.get('window');
  const scrollRef = useRef<ScrollView>(null);

  const [coralDemoPieces, setCoralDemoPieces] = useState(0);
  const [castleDemoCount, setCastleDemoCount] = useState(0);
  const [showFarm, setShowFarm] = useState(false);

  // Auto-cycle focus text on home crab (Relate / Steady / Perform vibe)
  useEffect(() => {
    const options: Focus[] = ['relationships', 'stress', 'performance'];
    let idx = options.indexOf(focus);
    if (idx < 0) idx = 0;

    const id = setInterval(() => {
      idx = (idx + 1) % options.length;
      onChangeFocus(options[idx]);
    }, 4500);

    return () => clearInterval(id);
  }, [focus, onChangeFocus]);

  const coralIcons = '🪸🐠🐟🪸🐡';
  const castleIcons = '🏖️🏰🪣⛱️🛟';

  return (
    <>
      <ScrollView
        ref={scrollRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={H}
        decelerationRate="fast"
        contentContainerStyle={{ height: H * PAGES }}
        style={{ flex: 1 }}
      >
        {/* ========== PAGE 1: SURFACE / HOME ========== */}
        <ImageBackground
          source={beachBg}
          style={[styles.page, { height: H, width: W }]}
          imageStyle={styles.surfaceBgImage}
        >
          <View style={styles.surfaceOverlay}>
            <Text style={styles.title}>Swell Getaway</Text>
            <Text style={styles.subtitle}>
              One calm reef that only grows when you do.
            </Text>
            <Text style={styles.meta}>
              Lv {levelLabel} · {totalXp} XP · {totalShells} 🐚
            </Text>

            {/* fuller beach card as "what this becomes" */}
            <View style={styles.surfaceCardLabelRow}>
              <Text style={styles.surfaceCardLabel}>
                Your shore snapshot
              </Text>
              <Text style={styles.surfaceCardHint}>
                Demo layout of how your space fills in.
              </Text>
            </View>
            <View style={{ marginBottom: 12 }}>
              <BeachScene
                unlocks={unlocks}
                levelLabel={levelLabel}
                totalShells={totalShells}
                compact={false}
              />
            </View>

            {/* BIG crab coach, centered and readable */}
            <Pressable onPress={onOpenCoach} style={styles.crabRow}>
              <View style={styles.crabBubble}>
                <Text style={styles.crabText} numberOfLines={3}>
                  {crabLine}
                </Text>
                <Text style={styles.crabHint}>
                  Tap to open your coach space.
                </Text>
              </View>
              <Image source={crabImg} style={styles.crabBig} />
            </Pressable>

            {/* Cucumber entry: integrated, not random */}
            {cucumbersAvailable > 0 && (
              <Pressable
                onPress={() => setShowFarm(true)}
                style={styles.cukeEntryPill}
              >
                <Text style={styles.cukeEntryEmoji}>🥒</Text>
                <View>
                  <Text style={styles.cukeEntryTitle}>
                    Sea cucumber farm (demo)
                  </Text>
                  <Text style={styles.cukeEntrySub}>
                    {cucumbersAvailable} ready · tap to view planting & redeeming.
                  </Text>
                </View>
              </Pressable>
            )}

            <Text style={styles.swipeHint}>
              Swipe up to dive to your reef.
            </Text>
          </View>
        </ImageBackground>

        {/* ========== PAGE 2: CORAL REEF ========== */}
        <View style={[styles.page, { height: H, width: W }]}>
          {/* faux gradient background */}
          <View style={styles.reefGradient} />
          <View style={styles.reefOverlay}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Coral reef</Text>
              <View style={styles.wipPill}>
                <Text style={styles.wipText}>WIP</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>
              Soft, underwater receipts of you actually showing up.
            </Text>

            <View style={styles.reefHud}>
              <Text style={styles.reefHudText}>
                XP {totalXp} · 🐚 {totalShells}
              </Text>
              <Text style={styles.reefHudSub}>
                Future: each streak tier adds coral & fish to your reef.
              </Text>
            </View>

            {/* Test coral builder */}
            <Pressable
              onPress={() =>
                setCoralDemoPieces((n) => (n < 8 ? n + 1 : n))
              }
              style={styles.coralCard}
            >
              <Text style={styles.coralTitle}>
                Test build coral (demo – would use shells)
              </Text>
              <Text style={styles.coralRow}>
                {coralIcons.slice(0, Math.max(1, coralDemoPieces || 1))}
              </Text>
              <Text style={styles.coralHint}>
                Tap to stack coral & fish. In the real app, each piece would
                cost shells earned from tiny reps.
              </Text>
            </Pressable>

            <Text style={styles.swipeHintLight}>
              Swipe up for your sandcastle shelf.
            </Text>
          </View>
        </View>

        {/* ========== PAGE 3: SANDCASTLE SHELF ========== */}
        <View style={[styles.page, { height: H, width: W }]}>
          <View style={styles.coveGradient} />
          <View style={styles.coveOverlay}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Sandcastle shelf
              </Text>
              <View style={styles.wipPill}>
                <Text style={styles.wipText}>WIP</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>
              A playful, low-pressure record of big wins & long streaks.
            </Text>

            {/* Test sandcastle builder */}
            <Pressable
              onPress={() =>
                setCastleDemoCount((n) => (n < 6 ? n + 1 : n))
              }
              style={styles.castleCard}
            >
              <Text style={styles.castleTitle}>
                Test build sandcastles (demo)
              </Text>
              <Text style={styles.castleEmojis}>
                {castleIcons
                  .repeat(Math.max(1, castleDemoCount || 1))
                  .slice(0, 20)}
              </Text>
              <Text style={styles.castleHint}>
                Imagine: unlock one special castle for each major achievement
                or meaningful streak you care about.
              </Text>
            </Pressable>

            <Text style={styles.swipeHintDark}>
              Swipe down to float back to your reef & crab.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ========== SEA CUCUMBER FARM MODAL (INTEGRATED) ========== */}
      <Modal
        visible={showFarm}
        transparent
        animationType="fade"
      >
        <Pressable
          style={styles.farmBackdrop}
          onPress={() => setShowFarm(false)}
        />
        <View style={styles.farmCard}>
          <Text style={styles.farmTitle}>
            Sea cucumber farm (demo)
          </Text>
          <Text style={styles.farmSub}>
            Visual-only preview. In the real app, you’d plant, grow, and redeem
            cucumbers into shells to nudge daily check-ins.
          </Text>
          <View style={styles.farmRow}>
            <Text style={styles.farmEmoji}>🥒🥒🥒</Text>
            <View>
              <Text style={styles.farmLabel}>
                Ready to harvest
              </Text>
              <Text style={styles.farmHint}>
                You have {cucumbersAvailable} waiting.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              onCollectCucumber();
            }}
            style={styles.farmButton}
          >
            <Text style={styles.farmButtonText}>
              Redeem all (demo – adds shells)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowFarm(false)}
            style={styles.farmSecondary}
          >
            <Text style={styles.farmSecondaryText}>
              Close
            </Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

/* ------- styles ------- */

const styles = StyleSheet.create({
  page: {
    position: 'relative',
  },

  /* --- PAGE 1: SURFACE / HOME --- */
  surfaceBgImage: {
    resizeMode: 'cover',
  },
  surfaceOverlay: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 56, // space for bottom tabs
    backgroundColor: 'rgba(0,0,0,0.14)',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  subtitle: {
    fontSize: 12,
    color: '#E5E7EB',
    marginTop: 4,
  },
  meta: {
    fontSize: 11,
    color: '#CFE3FF',
    marginTop: 2,
  },
  surfaceCardLabelRow: {
    marginTop: 10,
    marginBottom: 2,
  },
  surfaceCardLabel: {
    fontSize: 10,
    color: '#E5E7EB',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  surfaceCardHint: {
    fontSize: 9,
    color: '#CBD5F5',
  },

  crabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  crabBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 260,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.96)',
    marginRight: 8,
  },
  crabText: {
    fontSize: 12,
    color: '#F9FAFB',
  },
  crabHint: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  crabBig: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },

  cukeEntryPill: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  cukeEntryEmoji: {
    fontSize: 22,
    marginRight: 6,
  },
  cukeEntryTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E5F2FF',
  },
  cukeEntrySub: {
    fontSize: 9,
    color: '#AFC6E8',
  },

  swipeHint: {
    marginTop: 10,
    color: '#E5E7EB',
    fontSize: 10,
  },

  /* --- PAGE 2: REEF --- */
  reefGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    flexDirection: 'column',
  },
  reefOverlay: {
    flex: 1,
    paddingTop: 28,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EAF2FF',
  },
  sectionSub: {
    fontSize: 12,
    color: '#D6E4F7',
    marginTop: 2,
  },
  wipPill: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  wipText: {
    fontSize: 8,
    color: '#FBBF24',
    fontWeight: '600',
  },
  reefHud: {
    marginTop: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  reefHudText: {
    fontSize: 11,
    color: '#E5F2FF',
  },
  reefHudSub: {
    fontSize: 9,
    color: '#9FBAD9',
    marginTop: 2,
  },
  coralCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(1,90,120,0.98)',
  },
  coralTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EAF8FF',
  },
  coralRow: {
    fontSize: 20,
    marginTop: 4,
  },
  coralHint: {
    fontSize: 10,
    color: '#C4E4FF',
    marginTop: 4,
  },
  swipeHintLight: {
    marginTop: 16,
    color: '#D7E7FF',
    fontSize: 10,
  },

  /* --- PAGE 3: SANDCASTLES --- */
  coveGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  coveOverlay: {
    flex: 1,
    paddingTop: 28,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  castleCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.97)',
  },
  castleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  castleEmojis: {
    fontSize: 22,
    marginTop: 6,
  },
  castleHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  swipeHintDark: {
    marginTop: 16,
    color: '#0F172A',
    fontSize: 10,
  },

  /* --- Farm modal --- */
  farmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  farmCard: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '26%',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#0B1220',
  },
  farmTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5F2FF',
  },
  farmSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  farmEmoji: {
    fontSize: 26,
    marginRight: 8,
  },
  farmLabel: {
    fontSize: 12,
    color: '#E5F2FF',
    fontWeight: '500',
  },
  farmHint: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  farmButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
  },
  farmButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#06140A',
  },
  farmSecondary: {
    marginTop: 6,
    alignItems: 'center',
  },
  farmSecondaryText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});

export default ReefHome;
