import * as SQLite from 'expo-sqlite';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

const db = SQLite.openDatabaseSync('todos.db');

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export const getTodos = async (): Promise<Todo[]> => {
  try {
    const result = await db.getAllAsync<Todo>('SELECT * FROM todos ORDER BY createdAt DESC');
    return result;
  } catch (error) {
    console.error('Error getting todos:', error);
    return [];
  }
};

export const addTodo = async (text: string): Promise<Todo | null> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO todos (text, completed) VALUES (?, ?)',
      [text, 0]
    );

    if (result.lastInsertRowId) {
      const newTodo = await db.getFirstAsync<Todo>(
        'SELECT * FROM todos WHERE id = ?',
        [result.lastInsertRowId]
      );
      return newTodo || null;
    }
    return null;
  } catch (error) {
    console.error('Error adding todo:', error);
    return null;
  }
};

export const updateTodo = async (id: number, completed: boolean): Promise<boolean> => {
  try {
    await db.runAsync(
      'UPDATE todos SET completed = ? WHERE id = ?',
      [completed ? 1 : 0, id]
    );
    return true;
  } catch (error) {
    console.error('Error updating todo:', error);
    return false;
  }
};

export const deleteTodo = async (id: number): Promise<boolean> => {
  try {
    await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting todo:', error);
    return false;
  }
};

export const clearAllTodos = async (): Promise<boolean> => {
  try {
    await db.runAsync('DELETE FROM todos');
    return true;
  } catch (error) {
    console.error('Error clearing todos:', error);
    return false;
  }
};