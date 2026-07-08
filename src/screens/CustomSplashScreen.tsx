import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions, Easing } from 'react-native';
import Svg, { Polygon, Circle, Pattern, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

const loadingTexts = [
  "INFLATING BALLS...",
  "POLISHING PLAYER CAPS...",
  "DRAWING WHITE LINES...",
  "WARMING UP FINGERS...",
  "READY TO KICK!"
];

export const CustomSplashScreen: React.FC<Props> = ({ onFinish }) => {
  const [textIndex, setTextIndex] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Progress Bar Animation (3 seconds)
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000,
      easing: Easing.bezier(0.65, 0.05, 0.36, 1),
      useNativeDriver: false,
    }).start(() => {
      // Small delay before completing to read the last message
      setTimeout(onFinish, 400);
    });

    // Logo Bounce/Pop Animation (loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Starburst Pulse Animation (loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Soccer Ball Spin (loop)
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Text Rotation
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* Background Dots Pattern */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <Circle cx="10" cy="10" r="1" fill="#106e00" opacity="0.5" />
          </Pattern>
          <Rect width="100%" height="100%" fill="url(#dots)" />
        </Svg>
      </View>

      {/* Speed Lines */}
      <View style={[styles.speedLine, { top: 40, left: 40, width: 120 }]} />
      <View style={[styles.speedLine, { top: 80, left: 16, width: 180 }]} />
      <View style={[styles.speedLine, { bottom: 160, right: 40, width: 150 }]} />
      <View style={[styles.speedLine, { top: 160, right: 16, width: 90 }]} />

      {/* Background Starburst */}
      <View style={styles.starburstContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: 0.2 }}>
          <Svg width={400} height={400} viewBox="0 0 100 100">
            <Polygon 
              points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" 
              fill="#fcd400" 
            />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.mainContent}>
        {/* Logo Container */}
        <Animated.View style={[styles.logoWrapper, { transform: [{ translateY: bounceAnim }] }]}>
          {/* Hard Shadow */}
          <View style={styles.logoShadow} />
          
          {/* Main Logo Image */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.logoImage}
            />
          </View>

          {/* Decorative Stars */}
          <View style={[styles.miniStar, { top: -15, right: -15, transform: [{ rotate: '12deg' }] }]}>
            <Svg width={40} height={40} viewBox="0 0 100 100">
              <Polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="#ffe16d" stroke="#1c1b1b" strokeWidth="8"/>
            </Svg>
          </View>
          <View style={[styles.miniStar, { bottom: -10, left: -20, transform: [{ rotate: '-45deg' }] }]}>
            <Svg width={35} height={35} viewBox="0 0 100 100">
              <Polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="#ffd3cc" stroke="#1c1b1b" strokeWidth="6"/>
            </Svg>
          </View>
        </Animated.View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>FINGER</Text>
          <Text style={styles.titleText}>FOOTBALL</Text>
        </View>
      </View>

      {/* Loading Section */}
      <View style={styles.loadingSection}>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
            {/* Spinning Ball at the end */}
            <View style={styles.ballIconContainer}>
              <Animated.Text style={[styles.ballIcon, { transform: [{ rotate: spin }] }]}>⚽</Animated.Text>
            </View>
          </Animated.View>
        </View>
        <Text style={styles.loadingText}>{loadingTexts[textIndex]}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2ae500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    height: 3,
    borderRadius: 999,
    transform: [{ rotate: '-45deg' }],
  },
  starburstContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginBottom: 50,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  logoShadow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(28, 27, 27, 0.4)',
    borderRadius: 40,
  },
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#1c1b1b',
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  miniStar: {
    position: 'absolute',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  titleText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#106e00',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textShadowColor: '#000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    lineHeight: 45,
  },
  loadingSection: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 32,
    backgroundColor: '#fcf9f8',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#39ff14', // Using primary-container equivalent green
    borderRightWidth: 4,
    borderColor: '#1c1b1b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ballIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  ballIcon: {
    fontSize: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1c1b1b',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
