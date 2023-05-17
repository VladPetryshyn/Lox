declare module "lox" {
  export class Lox {
    hadError: boolean;
    hadRuntimeError: boolean;
    private interpreter: any;

    run(file: string): string[];
    error(line: number, message: string): void;
    report(line: number, where: string, message: string): void;
    runtimeError(error: { message: string, token: { line: number } }): void;
  }

  export const LoxImplementation: Lox;
  export default function(): void;
}
