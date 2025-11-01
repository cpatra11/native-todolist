import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './themed-text';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const scale = useSharedValue(0.98);
  const appear = useSharedValue(0);

  React.useEffect(() => {
    appear.value = withTiming(1, { duration: 350 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 12 }) }],
    opacity: appear.value,
    translateY: (1 - appear.value) * 8,
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.cardBackground }, animatedStyle]}>
      <TouchableOpacity
        onPress={() => onToggle(todo.id)}
        style={styles.checkbox}
        onPressIn={() => (scale.value = 0.96)}
        onPressOut={() => (scale.value = 1)}
      >
        <Ionicons
          name={todo.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={todo.completed ? theme.accent ?? '#34D399' : theme.icon ?? '#64748B'}
        />
      </TouchableOpacity>
      <ThemedText
        style={[styles.text, todo.completed && styles.completedText]}
        numberOfLines={1}
      >
        {todo.text}
      </ThemedText>
      <TouchableOpacity onPress={() => onDelete(todo.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color={theme.tint ?? '#FF6B6B'} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkbox: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
});