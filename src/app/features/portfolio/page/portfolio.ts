import { Component } from '@angular/core';
import { Hero } from '../sections/hero/hero';
import { Experience } from '../sections/experience/experience';
import { Projects } from '../sections/projects/projects';
import { Skills } from '../sections/skills/skills';
import { About } from '../sections/about/about';
import { Contact } from '../sections/contact/contact';
import { PortfolioBackgroundAnimation } from '../ui/portfolio-background-animation/portfolio-background-animation';

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [Hero, Experience, Projects, Skills, About, Contact, PortfolioBackgroundAnimation],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class Portfolio {}
