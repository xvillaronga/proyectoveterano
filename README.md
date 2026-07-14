# Proyecto Veterano · versión responsive

Landing estática preparada para GitHub Pages y adaptada a ordenador, tableta y móvil.

## Qué cambia en móvil

- Cabecera compacta con logotipo y menú desplegable.
- Hero vertical pensado para pantallas pequeñas.
- Iconos clicables de Instagram, TikTok, YouTube y Spotify.
- Sección explicativa legible sin ampliar la pantalla.
- Imagen de la jukebox, el portátil y el móvil adaptada al ancho disponible.
- Lista completa de las 15 canciones con botones táctiles grandes.
- Reproductor fijo inferior con:
  - reproducir y pausar,
  - anterior y siguiente,
  - barra de progreso,
  - reproducción continua,
  - título de la canción activa.
- Respeto del área segura inferior de iPhone mediante `env(safe-area-inset-bottom)`.

En escritorio se conserva el diseño panorámico aprobado y se mantienen las zonas interactivas sobre la imagen.

## Correcciones del reproductor

- Los controles de escritorio están agrupados en una única fila y permanecen alineados verticalmente.
- El tiempo total visible se toma de la propiedad `duration` de cada canción en `app.js`; los metadatos del MP3 ya no sustituyen ese valor.
- La barra sigue usando internamente la duración real del audio para calcular el avance y permitir saltar a cualquier punto.
- Toda la anchura de cada fila de canción es pulsable, incluido el icono de reproducción del extremo derecho.
- La barra de tiempo de escritorio y móvil avanza automáticamente durante la reproducción y permite pulsar o arrastrar el indicador.

## Redes sociales

Las URL están configuradas provisionalmente con las páginas generales de cada servicio. Sustitúyelas en `index.html` por los perfiles reales del proyecto:

- Instagram
- TikTok
- YouTube
- Spotify

## Archivos MP3

Coloca los audios dentro de `assets/audio/` con estos nombres:

1. `01-la-chica-del-verano.mp3`
2. `02-te-volviste-loca.mp3`
3. `03-la-chica-en-pijama.mp3`
4. `04-esa-estrella-eres-tu.mp3`
5. `05-nueve-de-mayo.mp3`
6. `06-una-manana.mp3`
7. `07-pajaro-herido.mp3`
8. `08-tampoco-pido-tanto.mp3`
9. `09-mar-de-dudas.mp3`
10. `10-quiero-decirte.mp3`
11. `11-hace-poco.mp3`
12. `12-la-puerta-secreta.mp3`
13. `13-calles-mojadas.mp3`
14. `14-sinceros.mp3`
15. `15-tan-solo-una-cancion.mp3`

## Publicar en GitHub Pages

1. Sube todos los archivos a la raíz del repositorio.
2. En GitHub entra en `Settings` → `Pages`.
3. En `Build and deployment`, selecciona `Deploy from a branch`.
4. Elige la rama `main` y la carpeta `/root`.
5. Guarda los cambios.


## Ajuste de la nueva imagen inicial

- La proporción del tablero de escritorio se ha sincronizado con la imagen `approved-design-cropped.png` de 1484×1060 píxeles.
- Las 15 zonas de reproducción se han recolocado exactamente sobre las 15 filas de la nueva imagen y abarcan también el icono circular de reproducción.
- Los nombres y duraciones visibles en la propia imagen se han actualizado con los valores definidos en `app.js`.
