import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Platform,
} from 'react-native';
import { COLORS, SPRITES } from '../constants';
import { TUTORIAL_STEPS } from '../story/chapters';

export default function TutorialScreen({ onComplete, onBack, showSkip = true, replayMode = false }) {
  const [step, setStep] = useState(0);
  const [neverAgain, setNeverAgain] = useState(false);
  const current = TUTORIAL_STEPS[step];
  const isLast = step >= TUTORIAL_STEPS.length - 1;

  const finish = (skipAll = false) => {
    onComplete({ neverAgain: neverAgain || skipAll });
  };

  return (
    <ImageBackground
      source={SPRITES.menuHero}
      style={[styles.container, Platform.OS === 'web' && { minHeight: '100vh', width: '100%' }]}
      resizeMode="cover"
    >
      <View style={styles.scrim} />
      {showSkip && (
        <TouchableOpacity style={styles.skipTop} onPress={() => finish(true)}>
          <Text style={styles.skipTopText}>Skip ▶</Text>
        </TouchableOpacity>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.tag}>HOW TO PLAY</Text>
        <Text style={styles.title}>Phone Controls</Text>
        <Text style={styles.subtitle}>Left thumb moves · Right thumb shoots</Text>

        <View style={styles.stepCard}>
          <Text style={styles.stepIcon}>{current.icon}</Text>
          <Text style={styles.stepNum}>Step {step + 1} of {TUTORIAL_STEPS.length}</Text>
          <Text style={styles.stepTitle}>{current.title}</Text>
          <Text style={styles.stepBody}>{current.body}</Text>
        </View>

        <View style={styles.layoutDemo}>
          <View style={styles.demoSide}>
            <View style={styles.demoJoystick} />
            <Text style={styles.demoLabel}>LEFT — Move</Text>
          </View>
          <View style={styles.demoSide}>
            <View style={styles.demoBtns}>
              {['SHOOT', 'BOMB'].map(label => (
                <View
                  key={label}
                  style={[
                    styles.demoBtn,
                    (current.highlight === 'shoot' && label === 'SHOOT') ||
                    (current.highlight === 'bomb' && label === 'BOMB')
                      ? styles.demoBtnActive : null,
                  ]}
                >
                  <Text style={styles.demoBtnText}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.demoLabel}>RIGHT — Weapons</Text>
          </View>
        </View>

        {showSkip && (
          <TouchableOpacity style={styles.neverRow} onPress={() => setNeverAgain(v => !v)}>
            <View style={[styles.checkbox, neverAgain && styles.checkboxOn]}>
              {neverAgain && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.neverText}>Don't show tutorial again</Text>
          </TouchableOpacity>
        )}

        <View style={styles.nav}>
          {!isLast ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(s => s + 1)}>
              <Text style={styles.primaryText}>Next Step</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => finish(false)}>
              <Text style={styles.primaryText}>{replayMode ? 'Done' : 'Start Shooting'}</Text>
            </TouchableOpacity>
          )}
          {showSkip && (
            <TouchableOpacity style={styles.skipBtn} onPress={() => finish(true)}>
              <Text style={styles.skipBtnText}>Skip Tutorial</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6,3,12,0.82)' },
  skipTop: {
    position: 'absolute', top: 16, right: 20, zIndex: 10,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.wall,
  },
  skipTopText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  content: {
    padding: 24, alignItems: 'center', justifyContent: 'center', paddingTop: 48,
    flexGrow: 1,
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
  tag: { color: COLORS.combo, fontSize: 11, letterSpacing: 4, marginBottom: 8 },
  title: { color: COLORS.player, fontSize: 28, fontWeight: '900', letterSpacing: 3, marginBottom: 4 },
  subtitle: { color: COLORS.textDim, fontSize: 14, marginBottom: 20 },
  stepCard: {
    backgroundColor: 'rgba(18,8,24,0.95)',
    borderWidth: 1, borderColor: COLORS.wall, borderRadius: 14,
    padding: 24, width: '100%', maxWidth: 520, marginBottom: 20,
  },
  stepIcon: { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  stepNum: { color: COLORS.textDim, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  stepTitle: { color: COLORS.gold, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  stepBody: { color: COLORS.text, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  layoutDemo: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', maxWidth: 420, marginBottom: 20, gap: 24,
  },
  demoSide: { flex: 1, alignItems: 'center', gap: 8 },
  demoJoystick: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: COLORS.player,
    backgroundColor: 'rgba(255,34,102,0.15)',
  },
  demoBtns: { flexDirection: 'row', gap: 8 },
  demoBtn: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: COLORS.textDim,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  demoBtnActive: { borderColor: COLORS.player, backgroundColor: 'rgba(255,34,102,0.25)' },
  demoBtnText: { color: COLORS.text, fontWeight: '800', fontSize: 10 },
  demoLabel: { color: COLORS.combo, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  neverRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: COLORS.textDim,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { borderColor: COLORS.player, backgroundColor: COLORS.player },
  checkmark: { color: '#000', fontSize: 14, fontWeight: '900' },
  neverText: { color: COLORS.text, fontSize: 14 },
  nav: { alignItems: 'center', gap: 10 },
  primaryBtn: {
    backgroundColor: COLORS.player,
    paddingHorizontal: 40, paddingVertical: 14, borderRadius: 8,
  },
  primaryText: { color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  skipBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  skipBtnText: { color: COLORS.textDim, fontSize: 14, fontWeight: '600' },
  backBtn: { padding: 8 },
  backText: { color: COLORS.textDim, fontSize: 13 },
});
