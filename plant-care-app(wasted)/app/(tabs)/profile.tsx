import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, Divider, Dialog, Portal, Snackbar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../stores/authStore';
import { useHistoryStore } from '../../stores/historyStore';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GlassCard } from '../../components/GlassCard';
import { Colors } from '../../theme/colors';
import { api } from '../../services/api';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const { clearHistory } = useHistoryStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
  };

  const handlePickAvatar = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setSnackMsg('需要相册权限才能选择头像');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploading(true);
    try {
      const response = await api.updateAvatar(result.assets[0].uri);
      if (response.success && response.data) {
        await updateUser(response.data);
        setSnackMsg('头像更新成功');
      } else {
        setSnackMsg(response.error || '头像上传失败');
      }
    } catch (e: any) {
      setSnackMsg(e.message || '头像上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleClearCache = async () => {
    await clearHistory();
    setSnackMsg('缓存已清除');
  };

  return (
    <ScreenBackground variant="home">
      <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}>
        <Text style={styles.pageTitle}>个人中心</Text>

        <GlassCard style={styles.profileCard}>
          <TouchableOpacity onPress={handlePickAvatar} disabled={uploading} style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              {user?.avatar ? (
                <MaterialCommunityIcons name="account" size={32} color={Colors.primaryLight} />
              ) : (
                <MaterialCommunityIcons name="account" size={32} color={Colors.primaryLight} />
              )}
            </View>
            <View style={styles.avatarBadge}>
              {uploading ? (
                <ActivityIndicator size={10} color="#fff" />
              ) : (
                <MaterialCommunityIcons name="pencil" size={12} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.nickname || '植物爱好者'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </GlassCard>

        <GlassCard>
          <SettingsItem
            icon="delete-sweep"
            title="清除缓存"
            desc="清除本地缓存数据"
            onPress={handleClearCache}
          />
          <Divider style={styles.divider} />
          <SettingsItem
            icon="information-outline"
            title="关于"
            desc="植物养护助手 v1.0.0"
          />
        </GlassCard>

        <Button
          mode="outlined"
          onPress={() => setShowLogoutDialog(true)}
          style={styles.logoutBtn}
          textColor={Colors.error}
          contentStyle={styles.logoutBtnContent}
        >
          退出登录
        </Button>

        <Portal>
          <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>确认退出</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>确定要退出登录吗？</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowLogoutDialog(false)} textColor={Colors.textSecondary}>取消</Button>
              <Button onPress={handleLogout} textColor={Colors.error}>退出</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Snackbar visible={!!snackMsg} onDismiss={() => setSnackMsg('')} duration={2500} style={styles.snackbar}>
          {snackMsg}
        </Snackbar>
      </ScrollView>
    </ScreenBackground>
  );
}

function SettingsItem({ icon, title, desc, onPress }: { icon: string; title: string; desc: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.settingsItem} activeOpacity={0.6}>
      <MaterialCommunityIcons name={icon as any} size={22} color={Colors.primaryLight} />
      <View style={styles.settingsText}>
        <Text style={styles.settingsTitle}>{title}</Text>
        <Text style={styles.settingsDesc}>{desc}</Text>
      </View>
      {onPress && <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingTop: 56 },
  pageTitle: { color: Colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  profileCard: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderWidth: 2, borderColor: 'rgba(76,175,80,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#1a1a1a',
  },
  name: { color: Colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  email: { color: Colors.textSecondary, fontSize: 13 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  settingsText: { flex: 1 },
  settingsTitle: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  settingsDesc: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  divider: { backgroundColor: 'rgba(255,255,255,0.08)' },
  logoutBtn: { marginTop: 24, borderRadius: 14, borderColor: Colors.error },
  logoutBtnContent: { paddingVertical: 4 },
  dialog: { backgroundColor: Colors.surface, borderRadius: 20 },
  dialogTitle: { color: Colors.text },
  dialogText: { color: Colors.textSecondary },
  snackbar: { backgroundColor: Colors.surface },
});
