import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'portfolio-root',
   imports: [CommonModule, RouterOutlet],
  template: '<router-outlet />',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('portfolio-liriraid');
}
