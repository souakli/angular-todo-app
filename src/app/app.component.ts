import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TodoListComponent } from './components/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TodoListComponent],
  template: `
    <div class="app-container">
      <app-todo-list></app-todo-list>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'Todo App';
}
