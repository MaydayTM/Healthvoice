import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mic, Clock, Shield, ChevronRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: <Mic size={64} color="#0ea5e9" />,
    title: 'Spreek gewoon',
    description:
      'Log je gezondheid door te praten. Geen typen, geen menu\'s, geen gedoe. Zeg wat je wilt loggen en wij doen de rest.',
    color: '#0ea5e9',
  },
  {
    icon: <Clock size={64} color="#22c55e" />,
    title: 'In 3 seconden',
    description:
      'Van spraak naar gestructureerde data in minder dan 3 seconden. De snelste manier om je gezondheid bij te houden.',
    color: '#22c55e',
  },
  {
    icon: <Shield size={64} color="#8b5cf6" />,
    title: 'Jouw data',
    description:
      'Al je gegevens blijven van jou. Wij geven geen medisch advies en delen nooit je data met derden.',
    color: '#8b5cf6',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const translateX = useSharedValue(0);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    translateX.value = withSpring(-index * width, {
      damping: 20,
      stiffness: 90,
    });
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const slidesStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <View style={styles.header}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Overslaan</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <Animated.View style={[styles.slidesContainer, slidesStyle]}>
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.iconContainer}>{slide.icon}</View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => goToSlide(index)}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentSlide ? slides[currentSlide].color : '#e5e7eb',
                width: index === currentSlide ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Next button */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.nextButton,
            { backgroundColor: slides[currentSlide].color },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? 'Aan de slag' : 'Volgende'}
          </Text>
          <ChevronRight size={20} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#6b7280',
  },
  slidesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});
