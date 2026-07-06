// Error Boundary - 捕獲渲染錯誤，避免白畫面
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
  theme: ThemeColors;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export function ErrorBoundary(props: Omit<Props, 'theme'>) {
  const { theme } = useAppTheme();
  return <ErrorBoundaryClass {...props} theme={theme} />;
}

class ErrorBoundaryClass extends React.Component<Props, State> {
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
      const styles = createStyles(this.props.theme);
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

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgDark,
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
      color: theme.goldLight,
      marginBottom: TempleSpacing.sm,
    },
    message: {
      fontSize: TempleFonts.small,
      color: theme.textMuted,
      textAlign: 'center',
      marginBottom: TempleSpacing.lg,
    },
    button: {
      backgroundColor: theme.red,
      paddingHorizontal: TempleSpacing.lg,
      paddingVertical: TempleSpacing.sm,
      borderRadius: 10,
    },
    buttonText: {
      color: theme.goldLight,
      fontSize: TempleFonts.body,
      fontWeight: '700',
    },
  });
}
