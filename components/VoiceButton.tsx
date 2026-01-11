import React, { useEffect } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Mic, Check, X, Loader2 } from 'lucide-react-native';
import { RecordingState } from '../types';
import { colors, shadows } from '../constants/theme';

interface VoiceButtonProps {
  state: RecordingState;
  onPressIn: () => void;
  onPressOut: () => void;
  onCancel?: () => void;
  size?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VoiceButton({
  state,
  onPressIn,
  onPressOut,
  onCancel,
  size = 72,
}: VoiceButtonProps) {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const ringProgress = useSharedValue(0);

  // Elegant pulse animation for recording state
  useEffect(() => {
    if (state === 'recording') {
      // Subtle breathing animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      pulseOpacity.value = withTiming(0.15, { duration: 300 });
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [state]);

  // Rotation animation for processing state
  useEffect(() => {
    if (state === 'processing') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
      ringProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(rotation);
      cancelAnimation(ringProgress);
      rotation.value = withTiming(0, { duration: 200 });
      ringProgress.value = withTiming(0, { duration: 200 });
    }
  }, [state]);

  // Success/error animation
  useEffect(() => {
    if (state === 'success' || state === 'error') {
      scale.value = withSequence(
        withTiming(1.1, { duration: 120 }),
        withTiming(1, { duration: 120 })
      );
    }
  }, [state]);

  const handlePressIn = () => {
    if (state === 'idle') {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
      onPressIn();
    }
  };

  const handlePressOut = () => {
    if (state === 'recording') {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      onPressOut();
    }
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ringProgress.value, [0, 1], [1, 1.1]) }],
    opacity: interpolate(ringProgress.value, [0, 0.5, 1], [0.1, 0.2, 0.1]),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const getBackgroundColor = () => {
    switch (state) {
      case 'recording':
        return colors.terra.DEFAULT; // Terracotta when recording
      case 'processing':
        return colors.amber[700]; // Warm amber
      case 'success':
        return colors.success; // Olive green
      case 'error':
        return colors.error; // Muted red
      default:
        return colors.ink[800]; // Dark ink - elegant neutral
    }
  };

  const getBorderColor = () => {
    switch (state) {
      case 'recording':
        return colors.terra.light;
      case 'processing':
        return colors.amber[500];
      case 'success':
        return '#65A30D';
      case 'error':
        return '#DC2626';
      default:
        return colors.ink[600];
    }
  };

  const renderIcon = () => {
    const iconSize = size * 0.36;
    const iconColor = colors.paper[100];

    switch (state) {
      case 'recording':
        return <Mic size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'processing':
        return (
          <Animated.View style={iconStyle}>
            <Loader2 size={iconSize} color={iconColor} strokeWidth={1.5} />
          </Animated.View>
        );
      case 'success':
        return <Check size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'error':
        return <X size={iconSize} color={iconColor} strokeWidth={1.5} />;
      default:
        return <Mic size={iconSize} color={iconColor} strokeWidth={1.5} />;
    }
  };

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}>
      {/* Outer decorative ring */}
      <Animated.View
        style={[
          styles.outerRing,
          outerRingStyle,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            borderColor: getBorderColor(),
          },
        ]}
      />

      {/* Pulse effect */}
      <Animated.View
        style={[
          styles.pulse,
          pulseStyle,
          {
            width: size * 1.25,
            height: size * 1.25,
            borderRadius: size * 0.625,
            backgroundColor: getBackgroundColor(),
          },
        ]}
      />

      {/* Main button */}
      <AnimatedPressable
        style={[
          buttonStyle,
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={state === 'processing'}
      >
        {renderIcon()}
      </AnimatedPressable>

      {/* Recording indicator dot */}
      {state === 'recording' && (
        <View style={styles.recordingIndicator}>
          <Animated.View
            style={[
              styles.recordingDot,
              {
                backgroundColor: colors.terra.DEFAULT,
              }
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 1,
  },
  pulse: {
    position: 'absolute',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...shadows.elevated,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.paper[100],
  },
});
