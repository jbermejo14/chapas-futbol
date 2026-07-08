import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true } as any);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Determine Icon based on route name
        let iconStr = '';
        if (route.name === 'HomeTab') iconStr = '🏠'; // We can use home icon or ⚽
        else if (route.name === 'FriendsTab') iconStr = '👥'; // Amigos
        else if (route.name === 'CustomizationTab') iconStr = '🛡️'; // Club (Shield)
        else if (route.name === 'ShopTab') iconStr = '🛒'; // Store

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={isFocused ? styles.tabItemActive : styles.tabItemInactive}
          >
            <Text style={[styles.iconText, isFocused ? styles.iconTextActive : styles.iconTextInactive]}>
              {iconStr}
            </Text>
            <Text style={[styles.labelText, isFocused ? styles.labelTextActive : styles.labelTextInactive]}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 90, // h-24 equivalent
    backgroundColor: '#fcf9f8', // surface
    borderTopWidth: 4,
    borderTopColor: '#1c1b1b',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 15, // to account for safe area slightly if needed
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabItemInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    opacity: 0.7,
  },
  tabItemActive: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#39ff14', // primary-container
    borderRadius: 16, // rounded-xl
    borderWidth: 2,
    borderColor: '#1c1b1b',
    paddingVertical: 8,
    transform: [{ scale: 1.1 }],
    marginHorizontal: 5,
  },
  iconText: {
    fontSize: 26,
  },
  iconTextActive: {
    color: '#022100', // on-primary-container
  },
  iconTextInactive: {
    color: '#3c4b35', // on-surface-variant
  },
  labelText: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  labelTextActive: {
    color: '#022100', // on-primary-container
  },
  labelTextInactive: {
    color: '#3c4b35', // on-surface-variant
  }
});
