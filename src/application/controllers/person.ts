export interface Speaker {
  speak: (name?: string) => string;
}

export class PersonController implements Speaker {
  age?: number;

  speak(name?: string): string {
    return `Hello, ${name?.toUpperCase() ?? 'World'}. Você tem ${
      this.age?.toString() ?? '0'
    } anos.`;
  }
}
