import { Component, Input } from '@angular/core';
import { Todo } from '../../models/todo';
import { TodoService } from '../../services/todo.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="todo-item" [class.completed]="todo.completed">
      <div class="todo-content">
        <div class="todo-header">
          <h3>{{ todo.title }}</h3>
          <span class="todo-date">{{ todo.createdAt | date:'short' }}</span>
        </div>
        <p *ngIf="todo.description" class="todo-description">{{ todo.description }}</p>
      </div>
      <div class="todo-actions">
        <button (click)="onToggle()" class="todo-button toggle">
          {{ todo.completed ? '✓' : '○' }}
        </button>
        <button (click)="onDelete()" class="todo-button delete">×</button>
      </div>
    </div>
  `,
  styles: [`
    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      margin: 0.5rem 0;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    .completed {
      background-color: #f8f8f8;
      opacity: 0.7;
    }
    .completed .todo-content {
      text-decoration: line-through;
      color: #666;
    }
    .todo-content {
      flex-grow: 1;
      margin-right: 1rem;
    }
    .todo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .todo-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }
    .todo-date {
      font-size: 0.8rem;
      color: #666;
    }
    .todo-description {
      margin: 0;
      font-size: 0.9rem;
      color: #555;
    }
    .todo-actions {
      display: flex;
      gap: 0.5rem;
    }
    .todo-button {
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .toggle {
      background-color: #4CAF50;
      color: white;
    }
    .delete {
      background-color: #f44336;
      color: white;
    }
    .todo-button:hover {
      transform: scale(1.1);
    }
  `]
})
export class TodoItemComponent {
  @Input() todo!: Todo;

  constructor(private todoService: TodoService) {}

  onToggle() {
    this.todoService.toggleTodo(this.todo.id);
  }

  onDelete() {
    this.todoService.deleteTodo(this.todo.id);
  }
}
