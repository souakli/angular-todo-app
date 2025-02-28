import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="todo-form" #form="ngForm">
      <div class="form-group">
        <input
          type="text"
          [(ngModel)]="title"
          name="title"
          class="form-control"
          required
          i18n-placeholder
          placeholder="Nouvelle tâche"
        >
      </div>
      <div class="form-group">
        <textarea
          [(ngModel)]="description"
          name="description"
          class="form-control"
          i18n-placeholder
          placeholder="Description (optionnel)"
        ></textarea>
      </div>
      <button type="submit" [disabled]="!form.valid" class="btn btn-primary" i18n>
        Ajouter
      </button>
    </form>
  `,
  styles: [`
    .todo-form {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    textarea.form-control {
      min-height: 100px;
      resize: vertical;
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      background: #4CAF50;
      color: white;
    }
    .btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class TodoFormComponent {
  title = '';
  description = '';

  constructor(private todoService: TodoService) {}

  onSubmit() {
    if (this.title.trim()) {
      this.todoService.addTodo(this.title.trim(), this.description.trim());
      this.title = '';
      this.description = '';
    }
  }
}
