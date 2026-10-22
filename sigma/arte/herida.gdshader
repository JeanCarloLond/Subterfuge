// El destello de un golpe recibido: la figura entera se vuelve blanca un
// instante. Aclarar un sprite oscuro casi no se ve; la silueta en blanco, si.
shader_type canvas_item;

uniform float blanco : hint_range(0.0, 1.0) = 0.0;

void fragment() {
	vec4 color = texture(TEXTURE, UV);
	COLOR = vec4(mix(color.rgb, vec3(1.0), blanco), color.a) * vec4(1.0, 1.0, 1.0, COLOR.a);
}
