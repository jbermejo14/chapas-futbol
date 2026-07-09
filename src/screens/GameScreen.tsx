import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, TouchableOpacity, Image, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Svg, { Line } from 'react-native-svg';
import { useChapasStore } from '../store/chapasStore';
import { FORMATIONS, TEAMS, FIELDS, FormationId, TeamId } from '../data/chapasData';
import { colors } from '../theme/colors';
import { ChapaModular } from '../components/ChapaModular';
import { MatchResultOverlay } from '../components/MatchResultOverlay';
import { AI_PROFILES } from '../data/aiProfiles';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const BOARD_WIDTH = SCREEN_WIDTH;
const BOARD_HEIGHT = SCREEN_HEIGHT * 0.72;
const CHAPA_RADIUS = 16;
const BALL_RADIUS = 10;
const GOAL_WIDTH = 120;
const FRICTION = 0.95;
const MIN_VELOCITY = 0.1;
const RESTITUTION = 0.7;

type EntityType = 'ball' | 'p1' | 'p2';

type Entity = {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  number?: number;
};

const createInitialFormation = (p1FormId: FormationId, p2FormId: FormationId, currentField: any): Entity[] => {
  const entities: Entity[] = [];
  let idCounter = 0;

  const insets = currentField.wallInsets || { top: 0, bottom: 0, left: 0, right: 0 };
  const pW = BOARD_WIDTH - insets.left - insets.right;
  const pH = BOARD_HEIGHT - insets.top - insets.bottom;
  const cx = insets.left + pW / 2;
  const cy = insets.top + pH / 2;

  entities.push({
    id: idCounter++, type: 'ball',
    x: cx, y: cy,
    vx: 0, vy: 0, radius: BALL_RADIUS, mass: 1
  });

  const p1Form = FORMATIONS[p1FormId];
  const p2Form = FORMATIONS[p2FormId];

  p1Form.points.forEach(pt => {
    entities.push({
      id: idCounter++, type: 'p1',
      x: insets.left + pW * pt.xMultiplier,
      y: cy + (pH / 2) * pt.yMultiplier,
      vx: 0, vy: 0, radius: CHAPA_RADIUS, mass: 6,
      number: pt.number
    });
  });

  p2Form.points.forEach(pt => {
    entities.push({
      id: idCounter++, type: 'p2',
      x: insets.left + pW * (1 - pt.xMultiplier),
      y: cy - (pH / 2) * pt.yMultiplier,
      vx: 0, vy: 0, radius: CHAPA_RADIUS, mass: 6,
      number: pt.number
    });
  });

  return entities;
};

export const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mode, p1Team, p2Team, p1Formation, p2Formation, fieldId, matchId } = route.params;
  const { addWin, addCoins, user, level } = useChapasStore();
  const team1 = TEAMS[p1Team];
  const team2 = TEAMS[p2Team];
  const currentField = FIELDS[fieldId] || FIELDS['stadium-green'];
  
  const cpuProfile = useRef(AI_PROFILES[Math.floor(Math.random() * AI_PROFILES.length)]).current;

  const [entities, setEntities] = useState<Entity[]>([]);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [score, setScore] = useState({ 1: 0, 2: 0 });
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [matchXpGained, setMatchXpGained] = useState(0);
  
  const [goalBanner, setGoalBanner] = useState<{ scorer: 1 | 2; text: string } | null>(null);
  const goalScale = useRef(new Animated.Value(0)).current;
  const goalOpacity = useRef(new Animated.Value(0)).current;

  const [isAiming, setIsAiming] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
  const [activeEntityId, setActiveEntityId] = useState<number | null>(null);

  const entitiesRef = useRef<Entity[]>([]);
  const isMovingRef = useRef(false);
  const animationFrameRef = useRef<number>(undefined);
  const ballInTargetRef = useRef(false);

  const [matchStats, setMatchStats] = useState({
    1: { shots: 0, ballTouches: 0, shotsOnTarget: 0, blocks: 0 },
    2: { shots: 0, ballTouches: 0, shotsOnTarget: 0, blocks: 0 }
  });

  const matchStatsRef = useRef({
    1: { shots: 0, ballTouches: 0, shotsOnTarget: 0, blocks: 0 },
    2: { shots: 0, ballTouches: 0, shotsOnTarget: 0, blocks: 0 }
  });

  // Ref to hold latest state for PanResponder closures
  const gameStateRef = useRef({
    activePlayer, winner, mode, isAiming, activeEntityId, dragStart, dragCurrent
  });

  // Update ref on every render
  gameStateRef.current = {
    activePlayer, winner, mode, isAiming, activeEntityId, dragStart, dragCurrent
  };

  useEffect(() => {
    resetBoard();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const resetBoard = () => {
    entitiesRef.current = createInitialFormation(p1Formation, p2Formation, currentField);
    setEntities([...entitiesRef.current]);
    isMovingRef.current = false;
    ballInTargetRef.current = false;
  };

  const handleBackToMenu = () => {
    navigation.navigate('MainTabs');
  };

  const handleRematch = () => {
    setScore({ 1: 0, 2: 0 });
    setActivePlayer(1);
    setWinner(null);
    resetBoard();
  };

  const updatePhysics = () => {
    if (!isMovingRef.current) return;

    let allStopped = true;
    const currentEntities = entitiesRef.current;
    let goalScored: 1 | 2 | null = null;

    const goalLeft = (BOARD_WIDTH - GOAL_WIDTH) / 2;
    const goalRight = goalLeft + GOAL_WIDTH;

    for (let i = 0; i < currentEntities.length; i++) {
      let e = currentEntities[i];

      if (Math.abs(e.vx) > MIN_VELOCITY || Math.abs(e.vy) > MIN_VELOCITY) {
        allStopped = false;
        e.x += e.vx;
        e.y += e.vy;
        e.vx *= FRICTION;
        e.vy *= FRICTION;

        const insets = currentField.wallInsets || { top: 0, bottom: 0, left: 0, right: 0 };
        const BOUNDARY_LEFT = insets.left;
        const BOUNDARY_RIGHT = BOARD_WIDTH - insets.right;
        const BOUNDARY_TOP = insets.top;
        const BOUNDARY_BOTTOM = BOARD_HEIGHT - insets.bottom;

        if (e.x - e.radius < BOUNDARY_LEFT) { e.x = BOUNDARY_LEFT + e.radius; e.vx *= -RESTITUTION; }
        else if (e.x + e.radius > BOUNDARY_RIGHT) { e.x = BOUNDARY_RIGHT - e.radius; e.vx *= -RESTITUTION; }

        const inGoalXBounds = e.x > goalLeft && e.x < goalRight;

        if (e.type === 'ball') {
           const inGoalTop = e.y - e.radius < BOUNDARY_TOP && inGoalXBounds;
           const inGoalBottom = e.y + e.radius > BOUNDARY_BOTTOM && inGoalXBounds;
           if (inGoalTop || inGoalBottom) {
             if (!ballInTargetRef.current) {
               matchStatsRef.current[inGoalTop ? 1 : 2].shotsOnTarget += 1;
               ballInTargetRef.current = true;
             }
           } else {
             ballInTargetRef.current = false;
           }
        }

        if (e.y - e.radius < BOUNDARY_TOP) {
          if (inGoalXBounds) {
            if (e.type === 'ball' && e.y < BOUNDARY_TOP - e.radius) goalScored = 1;
          } else {
            e.y = BOUNDARY_TOP + e.radius; e.vy *= -RESTITUTION;
          }
        } else if (e.y + e.radius > BOUNDARY_BOTTOM) {
          if (inGoalXBounds) {
            if (e.type === 'ball' && e.y > BOUNDARY_BOTTOM + e.radius) goalScored = 2;
          } else {
            e.y = BOUNDARY_BOTTOM - e.radius; e.vy *= -RESTITUTION;
          }
        }
      } else {
        e.vx = 0;
        e.vy = 0;
      }
    }

    if (goalScored) {
      isMovingRef.current = false;
      handleGoal(goalScored);
      return;
    }

    for (let i = 0; i < currentEntities.length; i++) {
      for (let j = i + 1; j < currentEntities.length; j++) {
        let e1 = currentEntities[i];
        let e2 = currentEntities[j];

        let dx = e2.x - e1.x;
        let dy = e2.y - e1.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        let minDist = e1.radius + e2.radius;

        if (dist < minDist) {
          allStopped = false;
          let nx = dx / dist;
          let ny = dy / dist;
          let vxRel = e1.vx - e2.vx;
          let vyRel = e1.vy - e2.vy;
          let velAlongNormal = vxRel * nx + vyRel * ny;

            if (velAlongNormal > 0) {
              if ((e1.type === 'ball' && e2.type !== 'ball') || (e2.type === 'ball' && e1.type !== 'ball')) {
                const chapa = e1.type === 'ball' ? e2 : e1;
                const chapaPlayer = chapa.type === 'p1' ? 1 : 2;
                
                // Solo contamos el toque una vez por impacto inicial (cuando es más fuerte)
                if (velAlongNormal > MIN_VELOCITY) {
                  matchStatsRef.current[chapaPlayer].ballTouches += 1;
                }

                if (chapa.type === 'p1' && chapa.y > BOARD_HEIGHT * 0.75 && activePlayer === 2) {
                   if (velAlongNormal > MIN_VELOCITY) matchStatsRef.current[1].blocks += 1;
                } else if (chapa.type === 'p2' && chapa.y < BOARD_HEIGHT * 0.25 && activePlayer === 1) {
                   if (velAlongNormal > MIN_VELOCITY) matchStatsRef.current[2].blocks += 1;
                }
              }

              let jImpulse = (1 + RESTITUTION) * velAlongNormal / (1 / e1.mass + 1 / e2.mass);
              let impulseX = jImpulse * nx;
              let impulseY = jImpulse * ny;

              e1.vx -= impulseX / e1.mass;
              e1.vy -= impulseY / e1.mass;
              e2.vx += impulseX / e2.mass;
              e2.vy += impulseY / e2.mass;
            }

          let percent = 0.8;
          let slop = 0.01;
          let penetration = minDist - dist;
          if (penetration > slop) {
            let correction = (penetration / (1 / e1.mass + 1 / e2.mass)) * percent;
            e1.x -= nx * correction * (1 / e1.mass);
            e1.y -= ny * correction * (1 / e1.mass);
            e2.x += nx * correction * (1 / e2.mass);
            e2.y += ny * correction * (1 / e2.mass);
          }
        }
      }
    }

    setEntities([...currentEntities]);

    if (allStopped) {
      isMovingRef.current = false;
      evaluateTurn();
    } else {
      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    }
  };

  const handleGoal = (scorer: 1 | 2) => {
    // Usamos el updater para que no pille state viejo del closure
    setScore(prevScore => {
      const newScore = { ...prevScore, [scorer]: prevScore[scorer] + 1 };
      
      setGoalBanner({ scorer, text: '¡GOL!' });
  
      Animated.parallel([
        Animated.spring(goalScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(goalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
  
      setTimeout(() => {
        Animated.timing(goalOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setGoalBanner(null);
          goalScale.setValue(0);
          
          if (newScore[1] >= 2 || newScore[2] >= 2) {
            setMatchStats({
              1: { ...matchStatsRef.current[1] },
              2: { ...matchStatsRef.current[2] }
            });
            
            // Calculate XP
            const p1Goals = newScore[1];
            const isP1Win = newScore[1] >= 2;
            const xpGained = (p1Goals * 50) + (isP1Win ? 100 : 0) + 25;
            setMatchXpGained(xpGained);
            useChapasStore.getState().addXp(xpGained);

            if (newScore[1] >= 2) {
              setWinner(1);
              addWin();
              const reward = (route.params as any).entryFee ? (route.params as any).entryFee * 2 : 0;
              if (reward > 0) addCoins(reward);
            } else if (newScore[2] >= 2) {
              setWinner(2);
              if (mode === '2P') {
                 // In 2P mode, if P2 wins, maybe P2 gets the win? For now just use addWin
                 addWin();
              }
            }
          } else {
            setActivePlayer(scorer === 1 ? 2 : 1);
            resetBoard();
          }
        });
      }, 2000);

      return newScore;
    });
  };

  const evaluateTurn = () => {
    let resetNeeded = false;
    entitiesRef.current.forEach(e => {
      if (e.type !== 'ball') {
        const insets = currentField.wallInsets || { top: 0, bottom: 0, left: 0, right: 0 };
        const BOUNDARY_LEFT = insets.left;
        const BOUNDARY_RIGHT = BOARD_WIDTH - insets.right;
        const BOUNDARY_TOP = insets.top;
        const BOUNDARY_BOTTOM = BOARD_HEIGHT - insets.bottom;

        if (e.x < BOUNDARY_LEFT || e.x > BOUNDARY_RIGHT || e.y < BOUNDARY_TOP || e.y > BOUNDARY_BOTTOM) {
           e.y = e.y < BOUNDARY_TOP ? BOUNDARY_TOP + e.radius + 5 : BOUNDARY_BOTTOM - e.radius - 5;
           e.x = Math.max(BOUNDARY_LEFT + e.radius + 5, Math.min(e.x, BOUNDARY_RIGHT - e.radius - 5));
           e.vx = 0; e.vy = 0;
           resetNeeded = true;
        }
      }
    });

    if (resetNeeded) setEntities([...entitiesRef.current]);
    setActivePlayer(prev => prev === 1 ? 2 : 1);
  };

  const shoot = (id: number, vx: number, vy: number) => {
    const entity = entitiesRef.current.find(e => e.id === id);
    if (entity) {
      matchStatsRef.current[entity.type === 'p1' ? 1 : 2].shots += 1;
      entity.vx = vx;
      entity.vy = vy;
      isMovingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        const state = gameStateRef.current;
        if (isMovingRef.current || state.winner || (state.activePlayer === 2 && state.mode === '1P')) return false;
        
        const touchX = evt.nativeEvent.locationX;
        const touchY = evt.nativeEvent.locationY;
        
        const targetType = state.activePlayer === 1 ? 'p1' : 'p2';
        const touchedEntity = entitiesRef.current.find(e => {
          if (e.type !== targetType) return false;
          const dist = Math.sqrt(Math.pow(touchX - e.x, 2) + Math.pow(touchY - e.y, 2));
          return dist < e.radius * 3;
        });

        if (touchedEntity) {
          // Actualizamos también la ref manualmente para que esté disponible de inmediato en onPanResponderGrant
          gameStateRef.current.activeEntityId = touchedEntity.id;
          setActiveEntityId(touchedEntity.id);
          return true;
        }
        return false;
      },
      onPanResponderGrant: (evt) => {
        const state = gameStateRef.current;
        const entity = entitiesRef.current.find(e => e.id === state.activeEntityId);
        if (entity) {
          const start = { x: entity.x, y: entity.y };
          gameStateRef.current.dragStart = start;
          gameStateRef.current.dragCurrent = start;
          gameStateRef.current.isAiming = true;
          
          setDragStart(start);
          setDragCurrent(start);
          setIsAiming(true);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const state = gameStateRef.current;
        if (!state.isAiming) return;
        const current = { 
          x: state.dragStart.x + gestureState.dx, 
          y: state.dragStart.y + gestureState.dy 
        };
        gameStateRef.current.dragCurrent = current;
        setDragCurrent(current);
      },
      onPanResponderRelease: () => {
        const state = gameStateRef.current;
        if (!state.isAiming || state.activeEntityId === null) return;
        
        gameStateRef.current.isAiming = false;
        setIsAiming(false);
        
        const dx = state.dragStart.x - state.dragCurrent.x;
        const dy = state.dragStart.y - state.dragCurrent.y;
        
        let vx = dx * 0.12;
        let vy = dy * 0.12;
        
        const speed = Math.sqrt(vx*vx + vy*vy);
        const MAX_SPEED = 22;
        if (speed > MAX_SPEED) {
          vx = (vx / speed) * MAX_SPEED;
          vy = (vy / speed) * MAX_SPEED;
        }

        if (speed > 1) {
          shoot(state.activeEntityId, vx, vy);
        }
        
        gameStateRef.current.activeEntityId = null;
        setActiveEntityId(null);
      }
    })
  ).current;

  useEffect(() => {
    if (mode === '1P' && activePlayer === 2 && !isMovingRef.current && !winner) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activePlayer, isMovingRef.current, winner]);

  const makeAIMove = () => {
    const aiChapas = entitiesRef.current.filter(e => e.type === 'p2');
    const ball = entitiesRef.current.find(e => e.type === 'ball');
    if (!ball || aiChapas.length === 0) return;

    const targetGoalX = BOARD_WIDTH / 2;
    const insets = currentField.wallInsets || { top: 0, bottom: 0, left: 0, right: 0 };
    const targetGoalY = BOARD_HEIGHT - insets.bottom; // P1's goal is at the bottom

    // Vector from ball to goal
    const bgX = targetGoalX - ball.x;
    const bgY = targetGoalY - ball.y;
    const bgDist = Math.sqrt(bgX * bgX + bgY * bgY);
    
    // Normalized ball-to-goal vector
    const bgDirX = bgX / bgDist;
    const bgDirY = bgY / bgDist;

    // Ideal point for the chapa to hit the ball (exactly opposite to the goal direction)
    const impactDist = ball.radius + aiChapas[0].radius; 
    const idealHitX = ball.x - bgDirX * impactDist;
    const idealHitY = ball.y - bgDirY * impactDist;

    // Evaluate the best chapa
    let bestChapa = aiChapas[0];
    let bestScore = -Infinity;

    aiChapas.forEach(c => {
      const distToBall = Math.sqrt(Math.pow(c.x - ball.x, 2) + Math.pow(c.y - ball.y, 2));
      let score = -distToBall; // Prefer closer chapas

      // Calculate alignment: dot product between (chapa -> ball) and (ball -> goal)
      const cbX = ball.x - c.x;
      const cbY = ball.y - c.y;
      const cbDist = Math.sqrt(cbX * cbX + cbY * cbY);
      
      if (cbDist > 0) {
        const dotProduct = (cbX / cbDist) * bgDirX + (cbY / cbDist) * bgDirY;
        // High reward for being "behind" the ball relative to the goal (dotProduct close to 1)
        score += dotProduct * 300; 
      }

      if (score > bestScore) {
        bestScore = score;
        bestChapa = c;
      }
    });

    // Add a tiny bit of random error so the AI is not unbeatable
    const errorMarginX = (Math.random() - 0.5) * 2; 
    const errorMarginY = (Math.random() - 0.5) * 2;
    
    const dx = (idealHitX + errorMarginX) - bestChapa.x;
    const dy = (idealHitY + errorMarginY) - bestChapa.y;

    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) dist = 0.001; // Avoid NaN
    
    // Reduce max power and add slight error
    const neededPower = 12 + (bgDist / BOARD_HEIGHT) * 10 + (dist / BOARD_HEIGHT) * 10;
    const power = Math.max(12, Math.min(22, neededPower + (Math.random() * 4 - 2)));

    const vx = (dx / dist) * power;
    const vy = (dy / dist) * power;

    // Simulate Human Aiming Animation
    setActiveEntityId(bestChapa.id);
    const start = { x: bestChapa.x, y: bestChapa.y };
    setDragStart(start);
    setDragCurrent(start);
    setIsAiming(true);

    const targetPullDx = vx / 0.12;
    const targetPullDy = vy / 0.12;

    let steps = 0;
    const maxSteps = 20; // 20 frames * 40ms = 800ms of aiming
    
    const aimInterval = setInterval(() => {
      steps++;
      const progress = steps / maxSteps;
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const wobbleX = Math.sin(steps * 0.5) * 4 * (1 - easeProgress);
      const wobbleY = Math.cos(steps * 0.5) * 4 * (1 - easeProgress);

      setDragCurrent({
        x: start.x - (targetPullDx * easeProgress) + wobbleX,
        y: start.y - (targetPullDy * easeProgress) + wobbleY
      });

      if (steps >= maxSteps) {
        clearInterval(aimInterval);
        setTimeout(() => {
          setIsAiming(false);
          setActiveEntityId(null);
          shoot(bestChapa.id, vx, vy);
        }, 400); // Wait 400ms holding the aim before releasing
      }
    }, 40);
  };

  const renderPitchStripes = () => {
    if (currentField.image) {
      const isRotated = !!currentField.imageRotation;
      
      return (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
          <Image 
            source={currentField.image} 
            style={[
              isRotated ? {
                position: 'absolute',
                width: BOARD_HEIGHT,
                height: BOARD_WIDTH,
                top: (BOARD_HEIGHT - BOARD_WIDTH) / 2,
                left: (BOARD_WIDTH - BOARD_HEIGHT) / 2,
                transform: [{ rotate: `${currentField.imageRotation}deg` }]
              } : {
                width: '100%', 
                height: '100%' 
              }
            ]} 
            resizeMode={currentField.imageResizeMode || "cover"} 
          />
        </View>
      );
    }
    const stripes = [];
    const stripeHeight = BOARD_HEIGHT / 10;
    for (let i = 0; i < 10; i++) {
      stripes.push(
        <View 
          key={i} 
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: i * stripeHeight,
            left: 0,
            width: BOARD_WIDTH,
            height: stripeHeight,
            backgroundColor: i % 2 === 0 ? currentField.color : currentField.stripeColor
          }} 
        />
      );
    }
    return stripes;
  };

  const activeEntity = entities.find(e => e.id === activeEntityId);

  return (
    <View style={styles.container}>
      <View style={styles.scoreboardContainer}>
        <View style={styles.scoreboardInner}>
          {/* HOME Team */}
          <View style={styles.scoreSide}>
            <View style={styles.profileAvatarContainer}>
              {user?.profilePictureUrl ? (
                <Image source={{ uri: user.profilePictureUrl }} style={styles.profileAvatarImage} />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Ionicons name="person" size={28} color="#000" />
                </View>
              )}
              <View style={{position: 'absolute', bottom: -10, backgroundColor: colors.blueAccent, paddingHorizontal: 6, borderRadius: 10, borderWidth: 1, borderColor: '#000'}}>
                <Text style={{color: '#FFF', fontSize: 10, fontWeight: '900'}}>LVL {level}</Text>
              </View>
            </View>
          </View>

          {/* Central Score Area */}
          <View style={styles.centerSection}>
            {/* Turn Pill */}
            <View style={[styles.turnPill, { backgroundColor: activePlayer === 1 ? '#39ff14' : '#ffdad4' }]}>
              <View style={styles.rimLight} />
              <Text style={[styles.turnPillText, { color: activePlayer === 1 ? '#107100' : '#410000' }]}>
                {activePlayer === 1 ? 'TU TURNO' : 'TURNO RIVAL'}
              </Text>
            </View>

            {/* Score Box */}
            <View style={styles.scoreBox}>
              <View style={styles.rimLight} />
              <Text style={styles.scoreNumber}>{score[1]}</Text>
              <Text style={styles.scoreDivider}>-</Text>
              <Text style={styles.scoreNumber}>{score[2]}</Text>
            </View>
          </View>

          {/* AWAY Team */}
          <View style={styles.teamSectionRight}>
            <View style={styles.profileAvatarContainer}>
              {mode !== '2P' && cpuProfile.profilePictureUrl ? (
                <Image source={{ uri: cpuProfile.profilePictureUrl }} style={styles.profileAvatarImage} />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Ionicons name="person" size={28} color="#000" />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {winner ? (
        <MatchResultOverlay 
          winner={winner}
          p1Score={score[1]}
          p2Score={score[2]}
          p1Image={team1.image}
          p2Image={team2.image}
          p1Svg={team1.svg}
          p2Svg={team2.svg}
          matchStats={matchStats}
          xpGained={matchXpGained}
          level={useChapasStore.getState().level}
          onContinue={handleBackToMenu}
          onRematch={handleRematch}
        />
      ) : (
        <View style={styles.boardWrapper}>
          
          {goalBanner && (
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 100, justifyContent: 'center', alignItems: 'center' }]}>
              <Animated.View style={{
                 transform: [{ scale: goalScale }],
                 opacity: goalOpacity,
                 backgroundColor: goalBanner.scorer === 1 ? team1.colorPrimary : team2.colorPrimary,
                 paddingHorizontal: 40,
                 paddingVertical: 20,
                 borderRadius: 20,
                 borderWidth: 4,
                 borderColor: '#FFF',
                 shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10
              }}>
                <Text style={{ fontSize: 60, fontWeight: '900', color: '#FFF', fontStyle: 'italic' }}>{goalBanner.text}</Text>
              </Animated.View>
            </View>
          )}

          <View style={[styles.board, { backgroundColor: currentField.color }]} {...panResponder.panHandlers}>
            
            {renderPitchStripes()}

            {!currentField.image && (
              <>
                <View pointerEvents="none" style={styles.centerLine} />
                <View pointerEvents="none" style={styles.centerCircle} />
                <View pointerEvents="none" style={[styles.penaltyArea, styles.penaltyTop]} />
                <View pointerEvents="none" style={[styles.penaltyArea, styles.penaltyBottom]} />
                
                <View pointerEvents="none" style={[styles.goal, styles.goalTop, { left: (BOARD_WIDTH - GOAL_WIDTH) / 2, width: GOAL_WIDTH, top: currentField.wallInsets?.top ? currentField.wallInsets.top - 20 : 0 }]} />
                <View pointerEvents="none" style={[styles.goal, styles.goalBottom, { left: (BOARD_WIDTH - GOAL_WIDTH) / 2, width: GOAL_WIDTH, bottom: currentField.wallInsets?.bottom ? currentField.wallInsets.bottom - 20 : 0 }]} />
              </>
            )}

            {isAiming && activeEntity && (
              <Svg style={StyleSheet.absoluteFill}>
                <Line
                  x1={dragStart.x}
                  y1={dragStart.y}
                  x2={dragStart.x - (dragCurrent.x - dragStart.x)}
                  y2={dragStart.y - (dragCurrent.y - dragStart.y)}
                  stroke={activePlayer === 1 ? team1.colorPrimary : team2.colorPrimary}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </Svg>
            )}

            {entities.map(e => {
              let bgColor = '#FFF';
              let borderColor = '#333';
              let teamData = null;
              
              if (e.type === 'ball') {
                return (
                  <View 
                    key={`entity-${e.id}`} 
                    pointerEvents="none"
                    style={[
                      styles.ball, 
                      { 
                        left: e.x - e.radius, top: e.y - e.radius,
                        width: e.radius * 2, height: e.radius * 2, borderRadius: e.radius 
                      }
                    ]} 
                  >
                     <View style={styles.ballInner} />
                  </View>
                );
              }
              
              let isActiveTurn = false;
              teamData = e.type === 'p1' ? team1 : team2;
              bgColor = teamData.colorSecondary;
              borderColor = teamData.colorPrimary;
              isActiveTurn = (activePlayer === 1 && e.type === 'p1') || (activePlayer === 2 && e.type === 'p2');
              
              const isTurnHighlight = isActiveTurn && !isMovingRef.current && !winner;

              return (
                <View 
                  key={`entity-${e.id}`} 
                  pointerEvents="none"
                  style={[
                    styles.chapa, 
                    { 
                      left: e.x - e.radius, 
                      top: e.y - e.radius,
                      width: e.radius * 2, 
                      height: e.radius * 2,
                      borderColor: teamData?.svg ? 'transparent' : borderColor,
                      borderWidth: teamData?.svg ? 0 : 3,
                      borderRadius: e.radius,
                    }
                  ]} 
                >
                  <ChapaModular 
                    size={e.radius * 2} 
                    FlagSvg={teamData?.svg} 
                    fallbackColor={bgColor} 
                    number={e.number} 
                  />
                  {isTurnHighlight && (
                    <View style={{
                      position: 'absolute',
                      top: -5, left: -5, right: -5, bottom: -5,
                      borderRadius: e.radius + 5,
                      borderWidth: 3,
                      borderColor: '#FFFFFF',
                      borderStyle: 'solid',
                      shadowColor: '#FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5
                    }} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}
      
      {/* Bottom Controls */}
      {!winner && (
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => navigation.navigate('MainTabs')}>
            <Ionicons name="menu" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn}>
            <Ionicons name="volume-mute" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
    paddingBottom: 60,
  },
  scoreboardContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 40,
    marginBottom: 10,
    zIndex: 50,
  },
  scoreboardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fcf9f8',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  profileAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  profileAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: '#e6e6e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  scoreSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamSectionRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  teamAvatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teamLabel: {
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#1c1b1b',
  },
  centerSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    zIndex: 10,
  },
  turnPill: {
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  turnPillText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  rimLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 1,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#1c1b1b',
  },
  scoreDivider: {
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#1c1b1b',
  },
  boardWrapper: {
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    backgroundColor: '#2E8B57',
    position: 'relative',
    overflow: 'hidden',
  },
  centerLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    top: BOARD_HEIGHT / 2 - 1,
  },
  centerCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    left: BOARD_WIDTH / 2 - 30,
    top: BOARD_HEIGHT / 2 - 30,
  },
  penaltyArea: {
    position: 'absolute',
    width: 140,
    height: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    left: BOARD_WIDTH / 2 - 70,
  },
  penaltyTop: {
    top: -2,
  },
  penaltyBottom: {
    bottom: -2,
  },
  goal: {
    position: 'absolute',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  goalTop: {
    top: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  goalBottom: {
    bottom: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  chapa: {
    position: 'absolute',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 4,
  },
  chapaInner: {
    width: '50%',
    height: '50%',
    borderRadius: 10,
    opacity: 0.8,
  },
  chapaNumberOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CHAPA_RADIUS,
  },
  chapaNumber: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ball: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  ballInner: {
    width: '40%',
    height: '40%',
    backgroundColor: '#333',
    borderRadius: 5,
  },
  winnerBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.blueAccent,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000',
    marginTop: 10,
  },
  winnerText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30, // Increased bottom margin
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  statsContainer: {
    width: '100%',
    minWidth: 280,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 20,
  },
  statsTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 5,
  },
  statLabel: {
    color: '#DDD',
    fontSize: 14,
    fontWeight: '600',
    flex: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
