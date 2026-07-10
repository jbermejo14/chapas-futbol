import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useChapasStore } from '../store/chapasStore';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack, rightAction }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { coins, user } = useChapasStore();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.headerLeft}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={32} color="#106e00" />
          </TouchableOpacity>
        ) : (
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarInner}>
              {user?.profilePictureUrl ? (
                <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={{ fontSize: 24 }}>👤</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.headerTitle}>{title}</Text>

      <View style={styles.headerRight}>
        {rightAction}
        
        <TouchableOpacity onPress={() => navigation.navigate('CoinShop')} activeOpacity={0.8} style={styles.coinsTouch}>
          <View style={styles.coinsBadgeWrapper}>
            <View style={styles.coinsBadgeShadow} />
            <View style={styles.coinsBadge}>
              <View style={styles.rimLight} />
              <Ionicons name="logo-bitcoin" size={16} color="#e9c400" />
              <Text style={styles.coinsText}>{coins.toLocaleString()}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fcf9f8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 4,
    borderBottomColor: '#1c1b1b',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: '#106e00',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  iconButton: {
    padding: 5,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#1c1b1b',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coinsTouch: {
    // container for touch
  },
  coinsBadgeWrapper: {
    position: 'relative',
  },
  coinsBadgeShadow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: -2,
    bottom: -2,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1c1b1b',
    position: 'relative',
    overflow: 'hidden',
  },
  rimLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 1,
  },
  coinsText: {
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    fontSize: 14,
    color: '#1c1b1b',
    marginLeft: 4,
    zIndex: 2,
  },
});
