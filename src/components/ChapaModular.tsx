import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import OverlaySvg from '../../assets/chapas/chapa_overlay.svg';

interface ChapaModularProps {
  size: number;
  FlagSvg?: React.FC<any>; // Componente SVG de la bandera
  fallbackColor?: string; // Color si no hay SVG
  number?: number;
}

export const ChapaModular: React.FC<ChapaModularProps> = ({ size, FlagSvg, fallbackColor = '#CCC', number }) => {
  const radius = size / 2;
  const innerSize = size * 0.85; // Borde más grueso estilo plástico
  const innerRadius = innerSize / 2;

  return (
    <View pointerEvents="none" style={[styles.container, { width: size, height: size, borderRadius: radius }]}>
      
      {/* Base plástico oscuro/metálico (borde exterior) */}
      <View style={[styles.plasticBase, { borderRadius: radius }]} />

      {/* Máscara y Bandera Base (Centro vibrante) */}
      <View style={[styles.mask, { 
        width: innerSize, 
        height: innerSize, 
        borderRadius: innerRadius, 
        backgroundColor: fallbackColor 
      }]}>
        {FlagSvg && (
          <FlagSvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
        )}
      </View>

      {/* Reflejo Blanco sutil superior derecho (Volumen 3D cómic) */}
      <View style={[styles.comicReflection, { 
        width: size * 0.4, 
        height: size * 0.2, 
        top: size * 0.1, 
        right: size * 0.1,
        borderRadius: size * 0.1,
      }]} />

      {/* CAPA 3: Overlay antiguo (mantenido por si añade textura) */}
      <View style={styles.overlay}>
        <OverlaySvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      {/* Dorsal */}
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
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0, // Sombra dura estilo cómic
  },
  plasticBase: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#000',
  },
  mask: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000',
  },
  comicReflection: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ rotate: '-15deg' }],
    zIndex: 15,
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    opacity: 0.5, // Reducimos opacidad para que el estilo cómic destaque más
  },
  numberOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  numberText: {
    color: '#FFF',
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0, // Sombra dura
  }
});
