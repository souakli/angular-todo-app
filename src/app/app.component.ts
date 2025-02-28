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
      <h1 i18n>liste des taches</h1>
      <app-todo-list></app-todo-list>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 1rem;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }
  `]
})
export class AppComponent {
  title = 'angular-todo-app';

  switchLanguage(lang: string) {
    const currentUrl = window.location.pathname;
    const baseHref = window.location.origin;
    window.location.href = `${baseHref}/${lang}/`;
  }
}
