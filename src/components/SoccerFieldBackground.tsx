import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Pattern } from 'react-native-svg';
import { colors } from '../theme/colors';

interface Props {
  children?: React.ReactNode;
}

export const SoccerFieldBackground: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Base Background color */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#106e00' }]} />
      
      {/* Striped Pattern using SVG */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Pattern id="stripes" x="0" y="0" width="80" height="100%" patternUnits="userSpaceOnUse">
            <Rect x="0" y="0" width="40" height="100%" fill="rgba(255, 255, 255, 0.05)" />
          </Pattern>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#stripes)" />
        </Svg>
      </View>

      {/* Field Markings */}
      {/* Top Goal Area */}
      <View style={styles.topGoalArea} />
      
      {/* Bottom Goal Area */}
      <View style={styles.bottomGoalArea} />
      
      {/* Center Line */}
      <View style={styles.centerLine} />
      
      {/* Center Circle & Point */}
      <View style={styles.centerCircle}>
        <View style={styles.centerPoint} />
      </View>

      {/* Visual Flavor: Speed Lines / Burst Corners */}
      <View style={[styles.speedLine, { top: 40, left: 40 }]} />
      <View style={[styles.speedLine, { bottom: 160, right: 40, width: 150, opacity: 0.4 }]} />

      {/* Children content rendered over the field */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    zIndex: 10,
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ translateY: -3 }],
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.4)',
    transform: [{ translateX: -128 }, { translateY: -128 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  topGoalArea: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -160 }],
    width: 320,
    height: 128,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  bottomGoalArea: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -160 }],
    width: 320,
    height: 128,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  speedLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // linear-gradient equivalent simplified
    height: 2,
    width: 100,
    transform: [{ rotate: '-45deg' }],
  }
});
