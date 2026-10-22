// La vineta (#184): oscurece los bordes de la pantalla. Cierra el encuadre y
// lleva la mirada al centro, donde esta el Cirujano.
shader_type canvas_item;

uniform vec4 color : source_color = vec4(0.03, 0.02, 0.03, 1.0);
// Donde empieza a oscurecer, y donde ya es del todo (en distancia al centro).
uniform float desde = 0.45;
uniform float hasta = 0.95;
uniform float fuerza = 0.85;

void fragment() {
	vec2 centro = UV - vec2(0.5);
	// La pantalla es 3:2: se corrige para que la vineta sea redonda.
	centro.x *= 1.5;
	float sombra = smoothstep(desde, hasta, length(centro) * 1.2);
	COLOR = vec4(color.rgb, sombra * fuerza);
}
