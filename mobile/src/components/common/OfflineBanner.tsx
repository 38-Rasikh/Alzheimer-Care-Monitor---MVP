import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Banner } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Banner
      visible={isOffline}
      icon={({ size }) => (
        <MaterialCommunityIcons name="wifi-off" size={size} color={colors.error} />
      )}
      style={styles.banner}
    >
      You are currently offline. Some features may be limited.
    </Banner>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.error + '20',
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
  },
});
