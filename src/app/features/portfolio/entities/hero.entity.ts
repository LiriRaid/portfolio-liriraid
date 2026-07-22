export interface IHeroCodeToken {
  readonly value: string;
  readonly className: string;
}

export interface IHeroCodeLine {
  readonly indent?: 1 | 2;
  readonly tokens: readonly IHeroCodeToken[];
}

export interface IHeroCvFile {
  readonly url: string;
  readonly fileName: string;
}

export interface IHeroWindowDot {
  readonly className: string;
}
