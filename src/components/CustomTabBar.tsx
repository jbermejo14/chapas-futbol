import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 15), height: 75 + Math.max(insets.bottom, 15) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true } as any);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        let iconName: any = 'home-outline';
        let labelOverride = 'TAB';

        if (route.name === 'HomeTab') {
          iconName = isFocused ? 'home' : 'home-outline';
          labelOverride = 'JUGAR';
        } else if (route.name === 'CustomizationTab') {
          iconName = isFocused ? 'shield' : 'shield-outline';
          labelOverride = 'CLUB';
        } else if (route.name === 'FriendsTab') {
          iconName = isFocused ? 'person' : 'person-outline';
          labelOverride = 'AMIGOS';
        } else if (route.name === 'ShopTab') {
          iconName = isFocused ? 'cart' : 'cart-outline';
          labelOverride = 'STORE';
        }

        const iconColor = isFocused ? '#000000' : '#71806b';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={isFocused ? styles.tabItemActive : styles.tabItemInactive}
            activeOpacity={0.8}
          >
            <Ionicons name={iconName} size={28} color={iconColor} style={styles.icon} />
            <Text style={[styles.labelText, isFocused ? styles.labelTextActive : styles.labelTextInactive]}>
              {labelOverride}
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
    height: 90, 
    backgroundColor: '#f8f8f8',
    borderTopWidth: 4,
    borderTopColor: '#1c1b1b',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabItemInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabItemActive: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#39ff14', 
    borderRadius: 14, 
    borderWidth: 2,
    borderColor: '#1c1b1b',
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  icon: {
    marginBottom: 2,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelTextActive: {
    color: '#000000', 
  },
  labelTextInactive: {
    color: '#71806b', 
  }
});
