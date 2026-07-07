import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

import OverlaySvg from '../../assets/chapas/chapa_overlay.svg';

interface ChapaModularProps {
  size: number;
  FlagSvg?: React.FC<any>; // Componente SVG de la bandera
  fallbackColor?: string; // Color si no hay SVG
  number?: number;
}

export const ChapaModular: React.FC<ChapaModularProps> = ({ size, FlagSvg, fallbackColor = '#CCC', number }) => {
  const radius = size / 2;

  return (
    <View pointerEvents="none" style={[styles.container, { width: size, height: size }]}>
      {/* CAPA 1 y 2: Máscara y Bandera Base */}
      <View style={[styles.mask, { borderRadius: radius, backgroundColor: fallbackColor }]}>
        {FlagSvg && (
          <FlagSvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        )}
      </View>

      {/* CAPA 3: Overlay Metálico y Brillo 3D */}
      <View style={styles.overlay}>
        <OverlaySvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      {/* Dorsal (Opcional, siempre por encima de todo) */}
      {number !== undefined && (
        <View style={styles.numberOverlay}>
          <Text style={[styles.numberText, { fontSize: size * 0.4 }]}>{number}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mask: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  numberOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', // Oscurecemos un poco para que el número resalte
    borderRadius: 1000, // Circular
  },
  numberText: {
    color: '#FFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
});
