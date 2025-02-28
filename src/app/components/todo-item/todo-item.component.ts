import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="todo-item" [class.completed]="todo.completed">
      <div class="todo-content">
        <input
          type="checkbox"
          [checked]="todo.completed"
          (change)="toggleComplete()"
          i18n-title
          title="Marquer comme terminé"
        >
        <div class="todo-text">
          <h3>{{ todo.title }}</h3>
          <p *ngIf="todo.description">{{ todo.description }}</p>
        </div>
      </div>
      <button 
        class="delete-btn" 
        (click)="deleteTodo()"
        i18n-title
        title="Supprimer la tâche"
      >×</button>
    </div>
  `,
  styles: [`
    .todo-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .todo-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .todo-text h3 {
      margin: 0;
      font-size: 1.1rem;
    }
    .todo-text p {
      margin: 0.5rem 0 0;
      color: #666;
      font-size: 0.9rem;
    }
    .completed .todo-text {
      text-decoration: line-through;
      color: #999;
    }
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .delete-btn {
      background: none;
      border: none;
      color: #ff4444;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0 0.5rem;
    }
    .delete-btn:hover {
      color: #ff0000;
    }
  `]
})
export class TodoItemComponent {
  @Input() todo!: Todo;

  constructor(private todoService: TodoService) {}

  toggleComplete() {
    this.todoService.toggleTodo(this.todo.id);
  }

  deleteTodo() {
    this.todoService.deleteTodo(this.todo.id);
  }
}
