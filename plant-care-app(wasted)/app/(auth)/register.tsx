import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput as RNTextInput } from 'react-native';
import { Text, Button, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GlassCard } from '../../components/GlassCard';
import { useAuth } from '../../stores/authStore';
import { Colors } from '../../theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

  const handleRegister = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('请填写邮箱和密码');
      return;
    }
    if (!isValidEmail(email)) {
      setError('邮箱格式不正确');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        nickname: nickname.trim() || undefined,
      });
      router.back();
    } catch (e: any) {
      setError(e.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground variant="auth">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>创建账号</Text>
            <Text style={styles.subtitle}>注册以开始使用植物养护助手</Text>
          </View>

          <GlassCard style={styles.formCard}>
            <InputRow icon="email-outline" placeholder="邮箱" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <InputRow icon="account-outline" placeholder="昵称（选填）" value={nickname} onChangeText={setNickname} />
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <RNTextInput
                placeholder="密码（至少 6 位）"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
              />
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={Colors.textSecondary}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              />
            </View>
            <InputRow icon="lock-check-outline" placeholder="确认密码" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />

            {error ? (
              <HelperText type="error" visible style={styles.errorText}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor={Colors.primary}
              labelStyle={styles.buttonLabel}
            >
              注册
            </Button>

            <Button
              mode="text"
              onPress={() => router.back()}
              style={styles.backButton}
              textColor={Colors.primaryLight}
            >
              已有账号？返回登录
            </Button>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

function InputRow({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.inputWrap}>
      <MaterialCommunityIcons name={icon as any} size={20} color={Colors.textSecondary} style={styles.inputIcon} />
      <RNTextInput
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  formCard: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    height: 50,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: Colors.error,
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 14,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
  },
});
