import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoItem } from '@/components/todo-item';
import { clearAllTodos, deleteTodo, getTodos, updateTodo, type Todo } from '@/utils/database';

export default function CompletedScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTodos();
    }, [])
  );

  const loadTodos = async () => {
    try {
      const allTodos = await getTodos();
      const completedTodos = allTodos.filter(todo => todo.completed);
      setTodos(completedTodos);
    } catch (error) {
      console.error('Error loading completed todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      const success = await updateTodo(id, false);
      if (success) {
        // Remove from completed list since it's now active
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      const success = await deleteTodo(id);
      if (success) {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleClearAllCompleted = async () => {
    Alert.alert(
      'Clear All Completed',
      'Are you sure you want to delete all completed todos? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clearAllTodos();
              if (success) {
                setTodos([]);
                Alert.alert('Success', 'All completed todos have been cleared.');
              }
            } catch (error) {
              console.error('Error clearing completed todos:', error);
              Alert.alert('Error', 'Failed to clear completed todos.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent ?? '#4CAF50'} />
          <ThemedText style={[styles.loadingText, { color: theme.icon }]}>Loading completed todos...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={{ color: theme.tint }}>Completed Todos</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>Tasks you've finished</ThemedText>
        {todos.length > 0 && (
          <ThemedView style={styles.clearButton}>
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.tint}
              onPress={handleClearAllCompleted}
            />
          </ThemedView>
        )}
      </ThemedView>

      <ScrollView style={styles.listContainer}>
        {todos.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color={theme.tint} />
            <ThemedText style={[styles.emptyText, { color: theme.tint }]}>No completed todos yet</ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: theme.icon }]}>Complete some tasks to see them here!</ThemedText>
          </ThemedView>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
          ))
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
    position: 'relative',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 8,
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});