/**
 * Abre Subterfuge Sigma (el remake en Godot, sigma/) desde la terminal (#185).
 *
 * Uso:
 *   npm run sigma                         jugar, desde la portada
 *   npm run sigma -- atrio                jugar, directo a una escena de sigma/escenas
 *   npm run sigma:editor                  abrir el proyecto en el editor de Godot
 *   npm run sigma:tests                   importar y pasar los tests
 *
 * Busca Godot 4.7 en este orden: la variable GODOT, `godot` o `godot4` en el
 * PATH, la instalacion de winget en Windows y la app en macOS. Si no lo
 * encuentra, dice como instalarlo.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const proyecto = join(raiz, 'sigma');

function enElPath(nombre) {
  const buscar = process.platform === 'win32' ? 'where' : 'which';
  const salida = spawnSync(buscar, [nombre], { encoding: 'utf8' });
  return salida.status === 0 ? salida.stdout.split(/\r?\n/)[0].trim() : null;
}

/** La de consola en Windows: asi los mensajes de Godot salen en esta terminal. */
function deWinget() {
  const paquetes = join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages');
  if (!existsSync(paquetes)) return null;
  for (const paquete of readdirSync(paquetes)) {
    if (!paquete.startsWith('GodotEngine.GodotEngine_')) continue;
    const carpeta = join(paquetes, paquete);
    const exe = readdirSync(carpeta).find((f) => /^Godot_v4.*_console\.exe$/.test(f));
    if (exe) return join(carpeta, exe);
  }
  return null;
}

function buscarGodot() {
  if (process.env.GODOT && existsSync(process.env.GODOT)) return process.env.GODOT;
  const mac = '/Applications/Godot.app/Contents/MacOS/Godot';
  return (
    enElPath('godot') ??
    enElPath('godot4') ??
    (process.platform === 'win32' ? deWinget() : null) ??
    (existsSync(mac) ? mac : null)
  );
}

function correr(godot, argumentos) {
  const { status } = spawnSync(godot, ['--path', proyecto, ...argumentos], { stdio: 'inherit' });
  return status ?? 1;
}

const godot = buscarGodot();
if (!godot) {
  console.error(
    'No encuentro Godot 4.7.\n' +
      '  Windows: winget install GodotEngine.GodotEngine\n' +
      '  macOS:   brew install --cask godot\n' +
      '  O descárgalo de https://godotengine.org/download y pon su ruta en la variable GODOT.',
  );
  process.exit(1);
}

const [modo, ...resto] = process.argv.slice(2);
let codigo;
if (modo === '--editor') {
  codigo = correr(godot, ['--editor']);
} else if (modo === '--tests') {
  codigo = correr(godot, ['--headless', '--import']);
  if (codigo === 0) codigo = correr(godot, ['--headless', '-s', 'res://tests/ejecutar.gd']);
} else {
  // La primera vez, o tras un pull con archivos nuevos, Godot tiene que
  // importar el arte antes de poder jugarlo.
  if (!existsSync(join(proyecto, '.godot', 'imported'))) {
    correr(godot, ['--headless', '--import']);
  }
  const escena = modo ? [`res://escenas/${modo.replace(/\.tscn$/, '')}.tscn`] : [];
  codigo = correr(godot, [...escena, ...resto]);
}
process.exit(codigo);
