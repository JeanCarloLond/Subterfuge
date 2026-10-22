## Los numeros del juego, los mismos del original (src/config/Sacramento.ts).
##
## Se copian tal cual a proposito: la sensacion del Cirujano esta ajustada con
## ellos, y migrar de motor no es la ocasion de cambiarla sin querer. Si se
## cambia un numero, se cambia aqui y por un motivo.
extends RefCounted

const MOVIMIENTO := {
	"velocidad_caminar": 130.0,
	"aceleracion_suelo": 1400.0,
	"aceleracion_aire": 700.0,
	"friccion_suelo": 1600.0,
	"friccion_aire": 300.0,
	"gravedad": 1000.0,
	"velocidad_caida_max": 620.0,
	"impulso_salto": 430.0,
	"impulso_doble_salto": 360.0,
	"coyote_ms": 90.0,
	"buffer_salto_ms": 120.0,
	"factor_corte_salto": 0.45,
}

const DASH := {
	"velocidad": 340.0,
	"duracion_ms": 160.0,
	"invulnerabilidad_ms": 130.0,
	"enfriamiento_ms": 420.0,
	"usos_en_aire": 1,
}

const AGARRE := {
	"deslizamiento": 0.0,
	"bloqueo_tras_soltar_ms": 220.0,
	"impulso_trepar": 300.0,
}

const CLAVADO := {
	"velocidad_trepa": 70.0,
	"salto_pared_x": 180.0,
	"salto_pared_y": 380.0,
}

const VITALIDAD := {
	"maxima": 6,
	"invulnerabilidad_ms": 700.0,
	"retroceso_x": 140.0,
	"retroceso_y": 180.0,
}

const DANO_POR_CAIDA := {
	"sin_dano_hasta": 160.0,
	"px_por_punto": 120.0,
	"dano_maximo": 3,
	"aturdimiento_ms": 320.0,
}


## Lo alto que sube un salto con este impulso: v^2 / (2g).
static func altura_de_salto(impulso: float) -> float:
	return impulso * impulso / (2.0 * MOVIMIENTO["gravedad"])
