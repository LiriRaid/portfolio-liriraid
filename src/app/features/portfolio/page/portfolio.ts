import { Component } from '@angular/core';
import { Hero } from '../sections/hero/hero';
import { Projects } from '../sections/projects/projects';
import { Skills } from '../sections/skills/skills';
import { About } from '../sections/about/about';
import { Contact } from '../sections/contact/contact';

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [Hero, Projects, Skills, About, Contact],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class Portfolio {}
