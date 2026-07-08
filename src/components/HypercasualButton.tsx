import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface HypercasualButtonProps {
  title: string;
  onPress: () => void;
  color?: 'primary' | 'secondary' | 'blueAccent';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export const HypercasualButton: React.FC<HypercasualButtonProps> = ({
  title,
  onPress,
  color = 'primary',
  style,
  textStyle,
  disabled = false,
}) => {
  const baseColor = colors[color] || colors.primary;
  
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress} 
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      {/* 2.5D Bottom Shadow/Depth */}
      <View style={[styles.depth, { backgroundColor: '#000' }]} />
      
      {/* Main Button Body */}
      <View style={[styles.body, { backgroundColor: baseColor }]}>
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    position: 'relative',
  },
  disabled: {
    opacity: 0.6,
  },
  depth: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    bottom: -8,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#000',
  },
  body: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900', // To mimic thick Comic/Burbank font
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  }
});
