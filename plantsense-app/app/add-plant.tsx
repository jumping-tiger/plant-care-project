import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGardenStore } from '../stores/gardenStore';
import { STATIC_PLANTS } from '../data/plants';
import type { GardenPlant } from '../types';

const PLANT_EMOJIS = ['🌿', '🪴', '🌱', '🌹', '🌵', '🎋', '🌸', '🌻', '🍀', '🪷'];

export default function AddPlantScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addPlant } = useGardenStore();
  const [nickname, setNickname] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🌿');
  const [wateringDays, setWateringDays] = useState('7');

  const handleAdd = async () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '请给植物起个昵称');
      return;
    }
    if (!selectedSpecies) {
      Alert.alert('提示', '请选择植物种类');
      return;
    }
    const plant: GardenPlant = {
      id: Date.now().toString(),
      nickname: nickname.trim(),
      species: selectedSpecies,
      emoji: selectedEmoji,
      addedAt: new Date().toISOString(),
      lastWatered: null,
      wateringIntervalDays: parseInt(wateringDays) || 7,
      reminderEnabled: false,
    };
    await addPlant(plant);
    Alert.alert('添加成功', `「${plant.nickname}」已加入你的花园 🌱`, [
      { text: '好的', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#e0e0e0" />
          </TouchableOpacity>
          <Text style={styles.title}>添加植物</Text>
          <View style={{ width: 26 }} />
        </View>

        <Text style={styles.label}>昵称</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="给你的植物起个名字"
          placeholderTextColor="#555"
        />

        <Text style={styles.label}>选择表情</Text>
        <View style={styles.emojiRow}>
          {PLANT_EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => setSelectedEmoji(e)}
              activeOpacity={0.7}
              style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnActive]}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>植物种类</Text>
        {STATIC_PLANTS.map(plant => (
          <TouchableOpacity
            key={plant.id}
            onPress={() => setSelectedSpecies(plant.name)}
            activeOpacity={0.7}
            style={[styles.speciesBtn, selectedSpecies === plant.name && styles.speciesBtnActive]}
          >
            <Text style={styles.speciesEmoji}>{plant.emoji}</Text>
            <Text style={[styles.speciesName, selectedSpecies === plant.name && styles.speciesNameActive]}>
              {plant.name}
            </Text>
            {selectedSpecies === plant.name && (
              <MaterialCommunityIcons name="check" size={18} color="#4caf50" style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>浇水间隔（天）</Text>
        <TextInput
          style={styles.input}
          value={wateringDays}
          onChangeText={setWateringDays}
          keyboardType="number-pad"
          placeholder="7"
          placeholderTextColor="#555"
        />

        <TouchableOpacity onPress={handleAdd} activeOpacity={0.8} style={styles.addBtn}>
          <Text style={styles.addBtnText}>添加到花园</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f1f0f' },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { color: '#e0e0e0', fontSize: 18, fontWeight: 'bold' },
  label: { color: '#aaa', fontSize: 13, marginBottom: 8, marginTop: 18 },
  input: {
    backgroundColor: '#1e2e1e', borderRadius: 10, padding: 14,
    color: '#e0e0e0', fontSize: 15, borderWidth: 1, borderColor: '#2a3e2a',
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e2e1e',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  emojiBtnActive: { borderColor: '#4caf50' },
  emojiText: { fontSize: 24 },
  speciesBtn: {
    backgroundColor: '#1e2e1e', borderRadius: 10, padding: 12, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'transparent',
  },
  speciesBtnActive: { borderColor: '#4caf50', backgroundColor: '#1e3e1e' },
  speciesEmoji: { fontSize: 24, marginRight: 12 },
  speciesName: { color: '#aaa', fontSize: 15 },
  speciesNameActive: { color: '#4caf50', fontWeight: '600' },
  addBtn: { backgroundColor: '#2d5a27', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 28 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
