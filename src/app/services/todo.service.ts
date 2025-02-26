import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Todo } from '../models/todo';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todos: Todo[] = [];
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        this.todos = JSON.parse(savedTodos);
        this.todosSubject.next(this.todos);
      }
    }
  }

  getTodos(): Observable<Todo[]> {
    return this.todosSubject.asObservable();
  }

  addTodo(title: string, description?: string): void {
    const newTodo: Todo = {
      id: Date.now(),
      title,
      description,
      completed: false,
      createdAt: new Date()
    };
    this.todos.push(newTodo);
    this.updateTodos();
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.updateTodos();
    }
  }

  deleteTodo(id: number): void {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.updateTodos();
  }

  private updateTodos(): void {
    this.todosSubject.next(this.todos);
    if (this.isBrowser) {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    }
  }
}
