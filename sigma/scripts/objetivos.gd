## Los objetivos (#215): lo que el juego dice que se busca. Decidido por Jean:
## «Averigua por que se mueven los muros», «Reune los registros (1/3)».
##
## El giro del canon: hasta el laboratorio los objetivos son del Cirujano; desde
## la primera vision los pone la nina (`de_la_nina`), y se pintan de otro color.
## El jugador obedece el texto de la pantalla como si fuera neutral.
##
## Aqui solo el catalogo y como se escribe cada uno; lo que se lleva ganado
## (cual toca y cuanto se ha contado) va en Progreso, que lo guarda.
extends RefCounted

## id -> {texto, total (si cuenta algo), siguiente (al completar la cuenta),
## de_la_nina}.
const CATALOGO := {
	"muros": {
		"texto": "¿Por qué se mueven los muros?",
	},
	"genesis": {
		"texto": "Busca el laboratorio de Génesis Vestal",
	},
	"registros": {
		"texto": "Reúne los registros de Génesis",
		"total": 3,
		"siguiente": "laboratorio",
	},
	"laboratorio": {
		"texto": "Entra en el laboratorio",
	},
	"adentro": {
		"texto": "Baja, que ya falta poco",
		"de_la_nina": true,
	},
	## Tras la primera vision: lo que ella pide. El Prior guarda la Nave del
	## Libro; ella lo llama «el señor del palo».
	"puerta": {
		"texto": "Pasa al señor del palo",
		"de_la_nina": true,
	},
}

const COLOR := Color(0.89, 0.663, 0.251)
## La nina (#243): el rojo de su venda y del ojo del Cirujano. Lo que ella pide
## se lee del mismo color con que se la ve.
const COLOR_NINA := Color(0.94, 0.42, 0.19)


static func existe(id: String) -> bool:
	return CATALOGO.has(id)


## Como se lee el objetivo `id` con `cuenta` hecha: con contador si cuenta algo.
static func texto(id: String, cuenta := 0) -> String:
	if not existe(id):
		return ""
	var objetivo: Dictionary = CATALOGO[id]
	if objetivo.has("total"):
		return "%s (%d/%d)" % [objetivo["texto"], mini(cuenta, objetivo["total"]), objetivo["total"]]
	return objetivo["texto"]


static func total(id: String) -> int:
	return CATALOGO.get(id, {}).get("total", 0)


## Lo que toca cuando se completa la cuenta de `id` ("" si nada).
static func siguiente(id: String) -> String:
	return CATALOGO.get(id, {}).get("siguiente", "")


static func de_la_nina(id: String) -> bool:
	return CATALOGO.get(id, {}).get("de_la_nina", false)


static func color(id: String) -> Color:
	return COLOR_NINA if de_la_nina(id) else COLOR
