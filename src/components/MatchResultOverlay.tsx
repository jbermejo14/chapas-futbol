import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface MatchResultOverlayProps {
  winner: 1 | 2;
  p1Score: number;
  p2Score: number;
  p1Image?: any;
  p2Image?: any;
  p1Svg?: React.FC<any>;
  p2Svg?: React.FC<any>;
  matchStats: {
    1: { shots: number, ballTouches: number, shotsOnTarget: number, blocks: number },
    2: { shots: number, ballTouches: number, shotsOnTarget: number, blocks: number }
  };
  xpGained?: number;
  level?: number;
  onContinue: () => void;
  onRematch: () => void;
}

export const MatchResultOverlay: React.FC<MatchResultOverlayProps> = ({
  winner,
  p1Score,
  p2Score,
  p1Image,
  p2Image,
  p1Svg: P1Svg,
  p2Svg: P2Svg,
  matchStats,
  xpGained,
  level,
  onContinue,
  onRematch
}) => {
  const insets = useSafeAreaInsets();
  
  // Animation for star
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* Background field pattern overlay */}
      <View style={styles.fieldOverlay} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={onContinue}>
          <Ionicons name="close" size={32} color="#106e00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MATCH RESULTS</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        
        {/* Victory Celebration */}
        <View style={styles.victoryContainer}>
          <Animated.View style={[styles.starContainer, { transform: [{ scale: scaleAnim }, { rotate: spin }] }]}>
            <Svg width="160" height="160" viewBox="0 0 200 200">
              <Path 
                d="M100 0L123 70H197L138 114L161 184L100 141L39 184L62 114L3 70H77L100 0Z" 
                fill="#fcd400" 
                stroke="#1c1b1b" 
                strokeWidth="6" 
              />
            </Svg>
          </Animated.View>
          
          <View style={styles.victoryBadgeWrapper}>
            <View style={styles.victoryBadgeShadow} />
            <View style={styles.victoryBadge}>
              <View style={styles.victoryBadgeRim} />
              <Text style={styles.victoryText}>
                {winner === 1 ? 'VICTORY!' : 'DEFEAT'}
              </Text>
            </View>
          </View>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCardWrapper}>
          <View style={styles.scoreCardShadow} />
          <View style={styles.scoreCard}>
            {/* Speed Lines */}
            <View style={styles.speedLineTopLeft} />
            <View style={styles.speedLineBottomRight} />

            <View style={styles.scoreRow}>
              {/* P1 */}
              <View style={styles.playerCol}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarShadow} />
                  <View style={[styles.avatar, { backgroundColor: '#705d00' }]}>
                    {p1Image && <Image source={p1Image} style={styles.avatarImage} />}
                    {P1Svg && !p1Image && <P1Svg width="100%" height="100%" />}
                  </View>
                </View>
                <Text style={styles.playerLabel}>YOU</Text>
              </View>

              {/* Score */}
              <View style={styles.scoreCenter}>
                <Text style={styles.scoreNumber}>{p1Score}</Text>
                <Text style={styles.scoreDash}>-</Text>
                <Text style={styles.scoreNumber}>{p2Score}</Text>
              </View>

              {/* P2 */}
              <View style={styles.playerCol}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarShadow} />
                  <View style={[styles.avatar, { backgroundColor: '#e5e2e1' }]}>
                    {p2Image && <Image source={p2Image} style={[styles.avatarImage, { opacity: 0.8 }]} />}
                    {P2Svg && !p2Image && <P2Svg width="100%" height="100%" style={{ opacity: 0.8 }} />}
                  </View>
                </View>
                <Text style={styles.playerLabel}>CPU</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <StatRow label="SHOTS" val1={matchStats[1].shots} val2={matchStats[2].shots} isPercentage={false} />
          <StatRow label="TOUCHES" val1={matchStats[1].ballTouches} val2={matchStats[2].ballTouches} isPercentage={false} />
          <StatRow label="SAVES" val1={matchStats[1].blocks} val2={matchStats[2].blocks} isPercentage={false} />
        </View>

        {/* XP Gained display */}
        {xpGained !== undefined && level !== undefined && (
          <View style={styles.xpContainer}>
            <Text style={styles.xpGainedText}>+{xpGained} XP</Text>
            <Text style={styles.levelText}>Nivel Actual: {level}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btnWrapper} onPress={onContinue} activeOpacity={0.8}>
            <View style={styles.btnShadow} />
            <View style={[styles.btn, { backgroundColor: '#39ff14' }]}>
              <View style={styles.btnRim} />
              <Text style={styles.btnText}>CONTINUE</Text>
              <Ionicons name="arrow-forward" size={24} color="#022100" style={styles.btnIcon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnWrapper} onPress={onRematch} activeOpacity={0.8}>
            <View style={styles.btnShadow} />
            <View style={[styles.btn, { backgroundColor: '#fcd400' }]}>
              <View style={styles.btnRim} />
              <Text style={styles.btnText}>REMATCH</Text>
              <Ionicons name="refresh" size={24} color="#6e5c00" style={styles.btnIcon} />
            </View>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const StatRow = ({ label, val1, val2, isPercentage }: any) => {
  const total = val1 + val2;
  const p1Width = total === 0 ? 50 : (val1 / total) * 100;

  return (
    <View style={styles.statRowWrapper}>
      <View style={styles.statRowShadow} />
      <View style={styles.statRow}>
        <Text style={styles.statVal1}>{val1}{isPercentage ? '%' : ''}</Text>
        
        <View style={styles.statCenter}>
          <Text style={styles.statLabel}>{label}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${p1Width}%` }]} />
          </View>
        </View>

        <Text style={styles.statVal2}>{val2}{isPercentage ? '%' : ''}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(16, 110, 0, 0.95)', // Solid dark green but slightly transparent to see field behind
    zIndex: 100,
    elevation: 100,
  },
  fieldOverlay: {
    ...(StyleSheet.absoluteFill as any),
    opacity: 0.2,
    // we can skip the repeating linear gradient for RN or use a transparent image, for now just a solid color with opacity over the actual field
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fcf9f8',
    borderBottomWidth: 4,
    borderBottomColor: '#1c1b1b',
    paddingHorizontal: 15,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    zIndex: 10,
  },
  closeBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#106e00',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  victoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    height: 100,
  },
  starContainer: {
    position: 'absolute',
    top: -40,
    zIndex: 1,
  },
  victoryBadgeWrapper: {
    position: 'relative',
    transform: [{ rotate: '-3deg' }],
    zIndex: 2,
  },
  victoryBadgeShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#000',
  },
  victoryBadge: {
    backgroundColor: '#39ff14',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    paddingHorizontal: 30,
    paddingVertical: 10,
    position: 'relative',
  },
  victoryBadgeRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  victoryText: {
    fontSize: 48,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#022100',
    textTransform: 'uppercase',
  },
  scoreCardWrapper: {
    width: '100%',
    marginBottom: 30,
    position: 'relative',
  },
  scoreCardShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#000',
  },
  scoreCard: {
    backgroundColor: '#fcf9f8',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    padding: 20,
    position: 'relative',
  },
  speedLineTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#106e00',
  },
  speedLineBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#106e00',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  playerCol: {
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  avatarShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 80,
    height: 80,
    backgroundColor: '#000',
    borderRadius: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#1c1b1b',
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playerLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1c1b1b',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  scoreCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 64,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#1c1b1b',
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  scoreDash: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1c1b1b',
    marginHorizontal: 10,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  statRowWrapper: {
    marginBottom: 12,
    position: 'relative',
  },
  statRowShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: '#000',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0eded',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    padding: 12,
  },
  statVal1: {
    width: 50,
    fontSize: 24,
    fontWeight: '900',
    color: '#106e00',
  },
  statVal2: {
    width: 50,
    fontSize: 24,
    fontWeight: '900',
    color: '#c00100',
    textAlign: 'right',
  },
  statCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#3c4b35',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  barBg: {
    width: '100%',
    height: 16,
    backgroundColor: '#dcd9d9',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    flexDirection: 'row',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#39ff14',
    borderRightWidth: 2,
    borderColor: '#1c1b1b',
  },
  xpContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  xpGainedText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00cc00',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1c1b1b',
    marginTop: 5,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  btnWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 15,
  },
  btnShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 12,
    position: 'relative',
  },
  btnRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  btnText: {
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#022100',
  },
  btnIcon: {
    marginLeft: 10,
    fontWeight: 'bold',
  }
});
