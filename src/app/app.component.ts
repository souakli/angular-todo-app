import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TodoFormComponent } from './components/todo-form/todo-form.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TodoFormComponent, TodoListComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8 text-center">{{ 'My Todo List' }}</h1>
      <app-todo-form></app-todo-form>
      <app-todo-list></app-todo-list>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f3f4f6;
    }
  `]
})
export class AppComponent {
  title = 'angular-todo-app';
}
