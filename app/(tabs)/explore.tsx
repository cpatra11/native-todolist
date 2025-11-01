import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getTodos, type Todo } from '@/utils/database';

interface Stats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentTodos, setRecentTodos] = useState<Todo[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const todos = await getTodos();
      const completed = todos.filter(todo => todo.completed).length;
      const total = todos.length;
      const pending = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({
        total,
        completed,
        pending,
        completionRate,
      });

      // Get the 5 most recent todos
      setRecentTodos(todos.slice(0, 5));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent ?? '#4CAF50'} />
          <ThemedText style={[styles.loadingText, { color: theme.icon }]}>Loading statistics...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={{ color: theme.tint }}>Statistics</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.icon }]}>Your todo progress at a glance</ThemedText>
        </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <Ionicons name="list-outline" size={32} color={theme.tint} />
          <ThemedText style={styles.statNumber}>{stats.total}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Todos</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#2196F3" />
          <ThemedText style={styles.statNumber}>{stats.completed}</ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statCard}>
          <Ionicons name="time-outline" size={32} color="#FF9800" />
          <ThemedText style={styles.statNumber}>{stats.pending}</ThemedText>
          <ThemedText style={styles.statLabel}>Pending</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statCard}>
          <Ionicons name="trophy-outline" size={32} color={theme.tint} />
          <ThemedText style={styles.statNumber}>{stats.completionRate}%</ThemedText>
          <ThemedText style={styles.statLabel}>Completion Rate</ThemedText>
        </ThemedView>
      </ThemedView>

        <ThemedView style={styles.progressSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Progress Overview</ThemedText>
        <ThemedView style={styles.progressBar}>
          <ThemedView
            style={[
              styles.progressFill,
              { width: `${stats.completionRate}%`, backgroundColor: theme.tint }
            ]}
          />
        </ThemedView>
        <ThemedText style={styles.progressText}>
          {stats.completed} of {stats.total} todos completed
        </ThemedText>
      </ThemedView>

      {recentTodos.length > 0 && (
        <ThemedView style={styles.recentSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Todos</ThemedText>
          {recentTodos.map(todo => (
            <ThemedView key={todo.id} style={styles.recentTodo}>
              <Ionicons
                name={todo.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={todo.completed ? theme.tint : theme.icon}
              />
              <ThemedText
                style={[
                  styles.recentTodoText,
                  todo.completed && styles.completedTodoText
                ]}
                numberOfLines={1}
              >
                {todo.text}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      {stats.total === 0 && (
        <ThemedView style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={64} color="#666" />
          <ThemedText style={styles.emptyText}>
            No todos yet. Add some todos to see your statistics!
          </ThemedText>
        </ThemedView>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  progressSection: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
  },
  recentSection: {
    padding: 20,
  },
  recentTodo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  recentTodoText: {
    marginLeft: 12,
    flex: 1,
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
