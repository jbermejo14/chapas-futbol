import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface ComicPanelProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.shadow} />
      <View style={styles.panel}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 10,
  },
  shadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: '#000',
    borderRadius: 16,
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  }
});
