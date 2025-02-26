import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="todo-form">
      <input
        type="text"
        [(ngModel)]="title"
        name="title"
        i18n-placeholder
        placeholder="Nouvelle tâche"
        required
        class="todo-input"
      />
      <textarea
        [(ngModel)]="description"
        name="description"
        i18n-placeholder
        placeholder="Description (optionnel)"
        class="todo-textarea"
      ></textarea>
      <button type="submit" class="todo-button" i18n>Ajouter</button>
    </form>
  `,
  styles: [`
    .todo-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 500px;
      margin: 1rem auto;
      padding: 1rem;
    }
    .todo-input, .todo-textarea {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    .todo-textarea {
      min-height: 100px;
      resize: vertical;
    }
    .todo-button {
      padding: 0.5rem 1rem;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
    }
    .todo-button:hover {
      background-color: #45a049;
    }
  `]
})
export class TodoFormComponent {
  title: string = '';
  description: string = '';

  constructor(private todoService: TodoService) {}

  onSubmit() {
    if (this.title.trim()) {
      this.todoService.addTodo(this.title.trim(), this.description.trim());
      this.title = '';
      this.description = '';
    }
  }
}
