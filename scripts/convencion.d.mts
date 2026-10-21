// Tipos de scripts/convencion.mjs, para que los tests lo importen con tipos.
export declare const TIPOS: Readonly<Record<string, { emoji: string; uso: string }>>;
export declare const COMPONENTES: Readonly<Record<string, string>>;
export declare const LARGO_MAXIMO: number;
export declare function esExento(cabecera: string): boolean;
export declare function validarCabecera(cabecera: string): string[];
export declare function validarMensaje(mensaje: string): string[];
export declare function ayuda(): string;
