## Texturas con su mapa de normales: si junto a `x.png` hay un `x_n.png`
## (los generadores de los titeres los sacan), devuelve una CanvasTexture con
## los dos. Asi las luces del nivel (velas, Altares, hongos) modelan la figura:
## el lado que da a la vela se ilumina y el otro queda en sombra.
extends RefCounted


static func con_normales(ruta: String) -> Texture2D:
	var normal := ruta.replace(".png", "_n.png")
	if not ResourceLoader.exists(normal):
		return load(ruta)
	var textura := CanvasTexture.new()
	textura.diffuse_texture = load(ruta)
	textura.normal_texture = load(normal)
	return textura
