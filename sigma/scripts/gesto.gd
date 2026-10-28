## Estirar y aplastar (#235): lo que hace que un cuerpo se sienta vivo aunque
## su dibujo sea provisional. Cada gesto empieza en una escala (y una
## inclinacion) y vuelve a la normal; la figura multiplica la suya por esta. Se
## queda cuando llegue el arte definitivo: son tiempos, no dibujos.
extends RefCounted

enum Tipo { NINGUNO, DESPEGUE, ATERRIZAJE, AGARRE, IMPULSO, HERIDA, GOLPEADO }

## Tipo -> escala de partida (x, y), lo que tarda en volver (ms) e inclinacion
## de partida (radianes; negativa: hacia atras, contra donde mira).
const GESTOS := {
	# Al saltar: se estira hacia arriba.
	Tipo.DESPEGUE: {"escala": Vector2(0.8, 1.2), "ms": 150.0, "giro": 0.0},
	# Al caer: se aplasta contra el suelo. Mas cuanto mas cae.
	Tipo.ATERRIZAJE: {"escala": Vector2(1.25, 0.78), "ms": 160.0, "giro": 0.0},
	# Al clavarse en la pared: se encoge contra ella.
	Tipo.AGARRE: {"escala": Vector2(0.85, 1.12), "ms": 130.0, "giro": 0.0},
	# Al impulsarse (de la pared o con el Pulmon): estirado y algo inclinado.
	Tipo.IMPULSO: {"escala": Vector2(0.82, 1.18), "ms": 160.0, "giro": 0.12},
	# Golpeado: se encoge y se echa atras.
	Tipo.HERIDA: {"escala": Vector2(1.12, 0.9), "ms": 260.0, "giro": -0.24},
	# Un enemigo al que le entra el bisturi: se encoge un instante.
	Tipo.GOLPEADO: {"escala": Vector2(1.14, 0.9), "ms": 110.0, "giro": 0.0},
}


## Cuanto queda del gesto a los `ms`, de 1 (recien empezado) a 0 (acabado).
## Vuelve rapido al principio y se asienta despues.
static func resto(tipo: int, ms: float) -> float:
	if not GESTOS.has(tipo) or ms < 0.0:
		return 0.0
	var t := ms / float(GESTOS[tipo]["ms"])
	return 0.0 if t >= 1.0 else (1.0 - t) * (1.0 - t)


## La escala a los `ms` del gesto. `fuerza` (0 a 1) lo suaviza.
static func escala(tipo: int, ms: float, fuerza := 1.0) -> Vector2:
	if not GESTOS.has(tipo):
		return Vector2.ONE
	return Vector2.ONE.lerp(GESTOS[tipo]["escala"], resto(tipo, ms) * fuerza)


## La inclinacion a los `ms` del gesto, mirando a la derecha.
static func giro(tipo: int, ms: float, fuerza := 1.0) -> float:
	if not GESTOS.has(tipo):
		return 0.0
	return float(GESTOS[tipo]["giro"]) * resto(tipo, ms) * fuerza
