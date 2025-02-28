import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { Todo } from '../../models/todo';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoFormComponent, TodoItemComponent],
  template: `
    <div class="todo-container">
      <app-todo-form></app-todo-form>
      <div class="todo-stats">
        <p i18n>Total: {{ todos.length }} | Terminées: {{ completedCount }} | En cours: {{ todos.length - completedCount }}</p>
      </div>
      <div class="todo-list">
        <app-todo-item
          *ngFor="let todo of todos"
          [todo]="todo"
        ></app-todo-item>
        <p *ngIf="todos.length === 0" class="no-todos" i18n>
          Aucune tâche pour le moment. Ajoutez-en une !
        </p>
      </div>
    </div>
  `,
  styles: [`
    .todo-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .todo-stats {
      text-align: center;
      margin: 1rem 0;
      color: #666;
    }
    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .no-todos {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 2rem;
    }
  `]
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  completedCount = 0;

  constructor(private todoService: TodoService) {}

  ngOnInit() {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
      this.completedCount = todos.filter(todo => todo.completed).length;
    });
  }
}
