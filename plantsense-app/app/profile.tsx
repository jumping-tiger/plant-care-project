import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../stores/authStore';
import { api } from '../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) { Alert.alert('提示', '昵称不能为空'); return; }
    setSaving(true);
    const resp = await api.updateProfile({ nickname: nickname.trim() });
    setSaving(false);
    if (resp.success && resp.data) {
      await updateUser(resp.data);
      Alert.alert('保存成功', '昵称已更新');
    } else {
      Alert.alert('保存失败', resp.error || '请重试');
    }
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
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
          <Text style={styles.title}>个人中心</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* 头像区 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="account" size={64} color="#4caf50" />
          </View>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        {/* 昵称编辑 */}
        <View style={styles.card}>
          <Text style={styles.label}>昵称</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="输入你的昵称"
            placeholderTextColor="#555"
            editable={!saving}
          />
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.8}
            style={[styles.saveBtn, saving && { opacity: 0.5 }]}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.saveBtnText}>保存修改</Text>}
          </TouchableOpacity>
        </View>

        {/* 账号信息 */}
        <View style={styles.card}>
          <Text style={styles.label}>账号信息</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#666" />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
        </View>

        {/* 退出登录 */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={18} color="#ef5350" />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f1f0f' },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  title: { color: '#e0e0e0', fontSize: 18, fontWeight: 'bold' },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#1e3e1e', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#2d5a27', marginBottom: 10,
  },
  emailText: { color: '#666', fontSize: 13 },
  card: { backgroundColor: '#1e2e1e', borderRadius: 14, padding: 16, marginBottom: 14 },
  label: { color: '#4caf50', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  input: {
    backgroundColor: '#0f1f0f', borderRadius: 10, padding: 12,
    color: '#e0e0e0', fontSize: 15, borderWidth: 1, borderColor: '#2a3e2a', marginBottom: 12,
  },
  saveBtn: { backgroundColor: '#2d5a27', borderRadius: 10, padding: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { color: '#aaa', fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2e1a1a', borderRadius: 14, padding: 16, marginTop: 8,
  },
  logoutText: { color: '#ef5350', fontSize: 15, fontWeight: '600' },
});
