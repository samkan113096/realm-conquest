import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const PORTRAITS = {
  kira: require('../../assets/portraits/kira.png'),
  viper: require('../../assets/portraits/viper.png'),
  narrator: require('../../assets/portraits/narrator.png'),
};

export default function StoryOverlay({ lines, onComplete, onSkipForever }) {
  const [index, setIndex] = useState(0);
  if (!lines?.length) {
    onComplete?.();
    return null;
  }

  const line = lines[index];
  const isLast = index >= lines.length - 1;

  const finish = () => onComplete?.();

  const advance = () => {
    if (isLast) finish();
    else setIndex(i => i + 1);
  };

  const skipAll = () => finish();

  const neverAgain = () => {
    onSkipForever?.();
    finish();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.backdrop} />

      <TouchableOpacity style={styles.skipBtn} onPress={skipAll}>
        <Text style={styles.skipText}>Skip ▶▶</Text>
      </TouchableOpacity>

      <View style={styles.panel}>
        <Image source={PORTRAITS[line.portrait] || PORTRAITS.narrator} style={styles.portrait} />
        <View style={styles.textBox}>
          <Text style={styles.speaker}>{line.speaker}</Text>
          <Text style={styles.dialogue}>{line.text}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.nextBtn} onPress={advance}>
              <Text style={styles.nextText}>{isLast ? 'FIGHT!' : 'Continue ▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.neverBtn} onPress={neverAgain}>
              <Text style={styles.neverText}>Never show story again</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.progress}>{index + 1} / {lines.length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    justifyContent: 'flex-end',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  skipBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 210,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.textDim,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  skipText: { color: COLORS.text, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  panel: {
    flexDirection: 'row',
    backgroundColor: '#120818',
    borderWidth: 2,
    borderColor: COLORS.player,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  portrait: { width: 100, height: 100, borderRadius: 50, marginRight: 16 },
  textBox: { flex: 1 },
  speaker: {
    color: COLORS.combo,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  dialogue: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  nextBtn: {
    backgroundColor: COLORS.player,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
    marginBottom: 6,
  },
  nextText: { color: '#000', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  neverBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.wall,
    marginBottom: 6,
  },
  neverText: { color: COLORS.textDim, fontSize: 12 },
  progress: { color: COLORS.textDim, fontSize: 11, marginTop: 4, textAlign: 'right' },
});
