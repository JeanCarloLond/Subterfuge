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

## El bisturi (#183). El golpe sale al pulsar; mantenido, carga el siguiente.
const COMBATE := {
	"ataque": {
		"dano": 2,
		"anticipacion_ms": 60.0,
		"duracion_ms": 110.0,
		"enfriamiento_ms": 300.0,
		"alcance": 34.0,
		"alto": 22.0,
	},
	"cargado": {
		"dano": 6,
		"tiempo_carga_ms": 450.0,
		"coste_fervor": 30,
		"anticipacion_ms": 110.0,
		"duracion_ms": 150.0,
		"enfriamiento_ms": 520.0,
		"alcance": 42.0,
		"alto": 26.0,
	},
	## Golpe hacia abajo que conecta: sale despedido hacia arriba y recupera el
	## doble salto y el dash. Los rebotes se encadenan.
	"rebote": {
		"impulso": 400.0,
		"enfriamiento_ms": 90.0,
	},
	## Una lectura, no un escudo: la ventana es corta a proposito.
	"parry": {
		"ventana_ms": 140.0,
		"enfriamiento_ms": 480.0,
		"aturdimiento_ms": 900.0,
	},
	## Golpear justo despues de un parry (Blasphemous): sale casi sin aviso, se
	## adelanta y pega como el cargado sin gastar Fervor. Es el premio a leer
	## el golpe; la ventana es corta para que no salga sin querer.
	"contragolpe": {
		"ventana_ms": 400.0,
		"dano": 6,
		"anticipacion_ms": 30.0,
		"duracion_ms": 130.0,
		"enfriamiento_ms": 300.0,
		"alcance": 44.0,
		"alto": 24.0,
		"embestida_px": 12.0,
	},
}

## Rematar a un enemigo aturdido con interactuar (Blasphemous): lo mata sea
## cual sea su vida y paga Fervor. Mientras dura, el Cirujano no recibe golpes:
## una ejecucion interrumpida no se lee como tal.
const EJECUCION := {
	## Hasta donde llega: pegado al aturdido, como en Blasphemous.
	"alcance_x": 28.0,
	"alcance_y": 14.0,
	## Alza el bisturi y espera; luego el tajo, y el cuerpo cae.
	"alza_ms": 280.0,
	"duracion_ms": 720.0,
	"fervor": 25,
	"pausa_ms": 170.0,
	"zoom": 1.25,
}

## El Fervor se gana con el cuerpo y paga el golpe cargado.
const FERVOR := {
	"maximo": 100,
	"inicial": 0,
	"por_golpe_asestado": 6,
	"por_parry": 20,
}

## La Pocion de Carne: el trago deja quieto y vulnerable.
const POCION := {
	"cargas_maximas": 3,
	"curacion": 3,
	"duracion_ms": 600.0,
}

## La pausa al conectar (hitstop): lo que hace que un golpe se sienta solido.
const IMPACTO := {
	"golpe_ms": 55.0,
	"cargado_ms": 90.0,
	"parry_ms": 130.0,
	"contragolpe_ms": 120.0,
}

## Rozar el cuerpo de un enemigo: no se para con el parry, solo con i-frames.
const CONTACTO := {
	"dano": 1,
	"retroceso_x": 160.0,
	"retroceso_y": 140.0,
}

## Lo que el Cirujano tarda arrodillado ante un Altar.
const REZO_MS := 1100.0

const DEVOTO := {
	"vida": 8,
	"dano": 1,
	"velocidad_patrulla": 40.0,
	"velocidad_persecucion": 80.0,
	"rango_deteccion": 130.0,
	"rango_ataque": 26.0,
	## Solo golpea a quien esta a su altura: el bisturi del Devoto no llega a
	## quien salta por encima, y golpear al aire se leia como una trampa.
	"alcance_vertical": 14.0,
	"anticipacion_ataque_ms": 420.0,
	"duracion_ataque_ms": 120.0,
	"enfriamiento_ataque_ms": 1100.0,
	"memoria_ms": 2000.0,
}

## La Vestal: clero de la Diocesis. No pelea, administra: mantiene la distancia
## y lanza sellos del diezmo; si el Cirujano se le acerca, retrocede. Los
## numeros del original (src/config/Sacramento.ts).
const VESTAL := {
	"vida": 5,
	"velocidad": 55.0,
	"rango_deteccion": 210.0,
	## La distancia que intenta mantener, y la que la hace retroceder.
	"rango_preferido": 115.0,
	"rango_huida": 72.0,
	## Mas largo que el aviso del Devoto: se ve venir.
	"anticipacion_ms": 520.0,
	"enfriamiento_ms": 1500.0,
	"retroceso": 90.0,
	"memoria_ms": 2400.0,
	## Herida, se tambalea un instante; con su propio sello devuelto, lo que
	## un parado (Sigma): asi se la puede ejecutar.
	"aturdimiento_ms": 260.0,
}

## El sello del diezmo, el proyectil de la Vestal. Parado con el parry, sale
## rebotado mas rapido y hiere a quien lo lanzo.
const SELLO := {
	"velocidad": 165.0,
	"dano": 1,
	"vida_ms": 3200.0,
	"velocidad_devuelto": 260.0,
	"dano_devuelto": 3,
}

## La compactacion (#186): los muros que se mueven. Avisan antes de moverse
## (dos latidos) y van despacio: se esquivan pensando, no con reflejos.
const COMPACTACION := {
	"aviso_ms": 1500.0,
	"velocidad_avance": 32.0,
	"cerrado_ms": 2000.0,
	"velocidad_retroceso": 48.0,
	"reposo_ms": 4000.0,
	## Quedar entre un muro y la piedra: cuesta esto y devuelve al Altar.
	"dano_aplastado": 2,
}

## Los temblores: de vez en cuando el templo se encoge un poco, lejos. No hacen
## dano: son el aviso de fondo de que todo se esta compactando. El primero llega
## pronto, para que se vea; luego, cada medio minuto o asi, sin regla fija.
const TEMBLOR := {
	"primero_s": 8.0,
	"cada_min_s": 25.0,
	"cada_max_s": 45.0,
	"dura_s": 1.6,
	"amplitud_px": 2.0,
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
