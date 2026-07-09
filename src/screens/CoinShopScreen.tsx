import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useChapasStore } from '../store/chapasStore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'CoinShop'>;

const IMG_1000 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQQee3oOWMsHX2SR53bNi7Bjkbtj34mOYjEh9ufWqMHSqblaei7AEHiVqP_6VbcXkyvHcmU_ShAiSwmUONDgISS_fEp9nr1Xo9tXLI0kSVsuEAxo5bZ6gNYgoY8vRa_4MQ2xL_v_CbLbCW92BerxhUTclh-7lrYtmEfEoywke5aVlx4NsyyYbY3xL0raf56sRJV7zRUT_iXk5Cy4vkRMlja8olKaI16OdsgklDhbe3ZhA706PwPZgbm2xNg_XvrjzBNU_zD9t-NyE';
const IMG_5000 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1Oiy2-kBzsYQSH9zGCjShCpmqI47F9LHyS7BIduriCfCj9neqRtKkr2pWJ0PnOfvEzmiFdjy54rAttpTetO8n8kduYITJUKFqFzV0iqnmL9S12TzQCSs1KGz2iQ6XiEkfM8WXBQLZh1-O12IC97BmGAR_T8JT1OP824qBu_KwfUQZsLB5DdnsEfg8NASeNWSkYXOl0o2NmL_BoiDZfDttf4Duz777NG2M0-zRDHhmMpF4SiBh4y03TgIyJJlTV-7Yax7mib_zWfw';
const IMG_10000 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCptH1aUBnN3pq5RI7yj8sx-uBFe0q0vwwVFn3S_qfnVHwGZHl9j6IiqgPi4RD4Lly5Bc_UtglemZE69UIbj6GuMtJiRBXdjRTfCMBGoOGVxk5iKUqj2e5rqDKc3bbZKWxG8QRZZZ_cInyaoISq3i3J0uNtJI9nLJznCu276TDALutm1vRGAasD0Mh1AB_0Wpdp_PzaJryYY37bTgwJxGja5d1SLOmmPNdgTiax6iu5bYuZ0He4ZGsxbXGXf-Fv_x5BnbhoWderjRE';
const IMG_25000 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTlOk39BPOmgcHJrewbndvXK_dAE5fCj4fE_BD_JHCJl-RP3ke4jTIr72vhF5GTZGYPbNZDcbYZtB6-RMO7E1K3GDAOJ-t9eDD2yujo_AwBiMEtVYY_0YUh8cD1-R8mcj68sbPmkP1PKPTAisFxwEGVLtQHHVXASac4f7r3LvhpABDUyAfIm5-ZfRyZt57nXeUIan7fFEKV2JcETfkf-EcUZRXHafaWmjYLpQRhOAk2Z2TIuwnnIN6rt_uL8HIyWLfAPCpBPTuZJo';

export const CoinShopScreen: React.FC<Props> = ({ navigation }) => {
  const { coins, addCoins, user } = useChapasStore();
  const insets = useSafeAreaInsets();

  const handleBuy = (amount: number) => {
    // Simulated purchase
    addCoins(amount);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)} style={styles.avatarWrapper}>
            {user?.profilePictureUrl ? (
              <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={{ fontSize: 24 }}>👤</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>COIN SHOP</Text>
          
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsText}>{coins.toLocaleString()}</Text>
            <Ionicons name="logo-bitcoin" size={16} color="#705d00" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Up Banner */}
          <View style={styles.topUpBanner}>
            <View style={styles.sunburstBg} />
            <Text style={styles.topUpText}>TOP UP!</Text>
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            
            {/* Pack 1 */}
            <View style={styles.packCardWrapper}>
              <View style={styles.packCardShadow} />
              <View style={styles.packCard}>
                <View style={[styles.packImgContainer, { backgroundColor: '#39ff14' }]}>
                  <View style={styles.rimLight} />
                  <Image source={{ uri: IMG_1000 }} style={[styles.packImg, { width: 80, height: 80, bottom: -10 }]} />
                </View>
                <View style={styles.packInfo}>
                  <Text style={styles.packTitle}>1,000 COINS</Text>
                  <TouchableOpacity style={styles.buyBtnWrapper} onPress={() => handleBuy(1000)} activeOpacity={0.8}>
                    <View style={styles.buyBtnShadow} />
                    <View style={styles.buyBtn}>
                      <View style={styles.rimLight} />
                      <Text style={styles.buyBtnText}>0.99€</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Pack 2 */}
            <View style={styles.packCardWrapper}>
              <View style={styles.packCardShadow} />
              <View style={styles.packCard}>
                <View style={[styles.packImgContainer, { backgroundColor: '#ffd3cc' }]}>
                  <View style={styles.rimLight} />
                  <Image source={{ uri: IMG_5000 }} style={[styles.packImg, { width: 96, height: 96, bottom: -10 }]} />
                </View>
                <View style={styles.packInfo}>
                  <Text style={styles.packTitle}>5,000 COINS</Text>
                  <TouchableOpacity style={styles.buyBtnWrapper} onPress={() => handleBuy(5000)} activeOpacity={0.8}>
                    <View style={styles.buyBtnShadow} />
                    <View style={styles.buyBtn}>
                      <View style={styles.rimLight} />
                      <Text style={styles.buyBtnText}>2.99€</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Pack 3 */}
            <View style={styles.packCardWrapper}>
              <View style={styles.packCardShadow} />
              <View style={styles.packCard}>
                <View style={[styles.packImgContainer, { backgroundColor: '#fcd400' }]}>
                  <View style={styles.rimLight} />
                  <Image source={{ uri: IMG_10000 }} style={[styles.packImg, { width: 112, height: 112, bottom: -15 }]} />
                </View>
                <View style={styles.packInfo}>
                  <Text style={styles.packTitle}>10,000 COINS</Text>
                  <TouchableOpacity style={styles.buyBtnWrapper} onPress={() => handleBuy(10000)} activeOpacity={0.8}>
                    <View style={styles.buyBtnShadow} />
                    <View style={styles.buyBtn}>
                      <View style={styles.rimLight} />
                      <Text style={styles.buyBtnText}>4.99€</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Pack 4 (Best Value) */}
            <View style={styles.packCardWrapper}>
              {/* Best Value Badge */}
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.packCardShadow} />
              <View style={styles.packCard}>
                <View style={[styles.packImgContainer, { backgroundColor: '#106e00' }]}>
                  <View style={styles.rimLight} />
                  <Image source={{ uri: IMG_25000 }} style={[styles.packImg, { width: 128, height: 128, bottom: -20 }]} />
                </View>
                <View style={styles.packInfo}>
                  <Text style={styles.packTitle}>25,000 COINS</Text>
                  <TouchableOpacity style={styles.buyBtnWrapper} onPress={() => handleBuy(25000)} activeOpacity={0.8}>
                    <View style={styles.buyBtnShadow} />
                    <View style={[styles.buyBtn, { backgroundColor: '#39ff14' }]}>
                      <View style={styles.rimLight} />
                      <Text style={styles.buyBtnText}>9.99€</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fcf9f8',
    borderBottomWidth: 4,
    borderBottomColor: '#1c1b1b',
    paddingHorizontal: 16,
    paddingBottom: 10,
    shadowColor: '#1c1b1b',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    zIndex: 50,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#1c1b1b',
    backgroundColor: '#39ff14', // fallback
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#106e00',
    textTransform: 'uppercase',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcd400',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#1c1b1b',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  coinsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1c1b1b',
    marginRight: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  topUpBanner: {
    width: '100%',
    height: 120,
    backgroundColor: '#fcd400',
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#1c1b1b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#1c1b1b',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  sunburstBg: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    backgroundColor: '#ffe16d', // simplified sunburst effect
    opacity: 0.5,
  },
  topUpText: {
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#1c1b1b',
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    transform: [{ skewX: '-6deg' }],
    zIndex: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  packCardWrapper: {
    width: '47%',
    position: 'relative',
    marginBottom: 16,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ba1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1c1b1b',
    transform: [{ rotate: '12deg' }],
    zIndex: 20,
    shadowColor: '#1c1b1b',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  bestValueText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  packCardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#1c1b1b',
    borderRadius: 12,
  },
  packCard: {
    backgroundColor: '#eae7e7',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
  },
  packImgContainer: {
    height: 96,
    borderBottomWidth: 4,
    borderBottomColor: '#1c1b1b',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rimLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 5,
  },
  packImg: {
    position: 'absolute',
    zIndex: 10,
  },
  packInfo: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1c1b1b',
    marginTop: 4,
  },
  buyBtnWrapper: {
    width: '100%',
    position: 'relative',
  },
  buyBtnShadow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: -2,
    bottom: -2,
    backgroundColor: '#1c1b1b',
    borderRadius: 8,
  },
  buyBtn: {
    backgroundColor: '#fcd400',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buyBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1c1b1b',
    zIndex: 10,
  },
});
