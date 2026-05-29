// Error Boundary - 捕獲渲染錯誤，避免白畫面
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || '發生未知錯誤' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>🏛️</Text>
          <Text style={styles.title}>神明指引暫時中斷</Text>
          <Text style={styles.message}>{this.state.errorMessage}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>重新開始</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TempleTheme.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: TempleSpacing.lg,
  },
  icon: {
    fontSize: 64,
    marginBottom: TempleSpacing.md,
  },
  title: {
    fontSize: TempleFonts.heading,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.sm,
  },
  message: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    textAlign: 'center',
    marginBottom: TempleSpacing.lg,
  },
  button: {
    backgroundColor: TempleTheme.red,
    paddingHorizontal: TempleSpacing.lg,
    paddingVertical: TempleSpacing.sm,
    borderRadius: 10,
  },
  buttonText: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '700',
  },
});
