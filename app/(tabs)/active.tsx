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
import { TodoItem } from '@/components/todo-item';
import { deleteTodo, getTodos, updateTodo, type Todo } from '@/utils/database';

export default function ActiveScreen() {
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
      const activeTodos = allTodos.filter(todo => !todo.completed);
      setTodos(activeTodos);
    } catch (error) {
      console.error('Error loading active todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      const success = await updateTodo(id, true);
      if (success) {
        // Remove from active list since it's now completed
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent ?? '#4CAF50'} />
          <ThemedText style={[styles.loadingText, { color: theme.icon }]}>Loading active todos...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={{ color: theme.tint }}>
          Active Todos
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>Tasks that need to be done</ThemedText>
      </ThemedView>

      <ScrollView style={styles.listContainer}>
        {todos.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color={theme.tint} />
              <ThemedText style={[styles.emptyText, { color: theme.tint }]}>All caught up! 🎉</ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.icon }]}>No active todos remaining</ThemedText>
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
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    fontSize: 24,
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