import { Component } from '@angular/core';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';

export interface ContactLink {
  icon: string;
  label: string;
  value: string;
  href: string;
  external: boolean;
}

@Component({
  selector: 'portfolio-contact',
  standalone: true,
  imports: [PortfolioIcon, PortfolioButton],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  protected readonly contactLinks: ContactLink[] = [
    {
      icon: 'Email',
      label: 'Email',
      value: 'gabrielleonardocruzflores@gmail.com',
      href: 'mailto:gabrielleonardocruzflores@gmail.com',
      external: false,
    },
    {
      icon: 'Github',
      label: 'GitHub',
      value: 'github.com/liriraid',
      href: 'https://github.com/liriraid',
      external: true,
    },
    {
      icon: 'Linkedin',
      label: 'LinkedIn',
      value: 'linkedin.com/in/gabriel-leonardo-cruz-flores',
      href: 'https://www.linkedin.com/in/gabriel-leonardo-cruz-flores-64570a1a4/',
      external: true,
    },
  ];
}
