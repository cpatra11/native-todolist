import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoItem } from '@/components/todo-item';
import { addTodo as addTodoDB, deleteTodo as deleteTodoDB, getTodos, initDatabase, updateTodo, type Todo } from '@/utils/database';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const headerAppear = useSharedValue(0);
  useEffect(() => {
    headerAppear.value = withTiming(1, { duration: 420 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerAppear.value,
    transform: [{ translateY: (1 - headerAppear.value) * -8 }],
  }));

  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      await initDatabase();
      const todosData = await getTodos();
      setTodos(todosData);
    } catch (error) {
      console.error('Error loading todos:', error);
      Alert.alert('Error', 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (inputText.trim() === '') {
      Alert.alert('Error', 'Please enter a todo item');
      return;
    }

    try {
      const newTodo = await addTodoDB(inputText.trim());
      if (newTodo) {
        setTodos(prevTodos => [newTodo, ...prevTodos]);
        setInputText('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      Alert.alert('Error', 'Failed to add todo');
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        const success = await updateTodo(id, !todo.completed);
        if (success) {
          setTodos(prevTodos =>
            prevTodos.map(t =>
              t.id === id ? { ...t, completed: !t.completed } : t
            )
          );
        }
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      const success = await deleteTodoDB(id);
      if (success) {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      Alert.alert('Error', 'Failed to delete todo');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent ?? '#34D399'} />
          <ThemedText style={styles.loadingText}>Loading todos...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <ThemedText type="title" style={{ color: theme.tint }}>
          All Todos
        </ThemedText>
      </Animated.View>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardBackground || 'rgba(255,255,255,0.95)', borderColor: 'transparent' }]}
          placeholder="Add a new todo..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleAddTodo}
          returnKeyType="done"
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.tint }]} onPress={handleAddTodo}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.listContainer}>
        {todos.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color={theme.icon} />
            <ThemedText style={[styles.emptyText, { color: theme.icon }]}>No todos yet. Add one above!</ThemedText>
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
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  addButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
