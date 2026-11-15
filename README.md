# Undulaten i stua

Et lite nettleserspill der du flyr rundt som en undulat i en 3D-modell av
leiligheten fra filmen `IMG_0956_liten.mp4`. Modellen, teksturene, maleriene,
fuglen og musikken er laget i kode – det finnes ingen bilde- eller lydfiler.

## Slik spiller du

**Enklest:** åpne `undulaten.html` i en nettleser (dobbeltklikk). Filen er
selvstendig og trenger ingen server.

**Under utvikling:** start en enkel webserver i mappa og åpne `index.html`:

```bash
python3 -m http.server 8000
```

| | PC | Mobil / nettbrett |
|---|---|---|
| Fly fremover / brems | `W` / `S` (eller piltaster) | styrespak (venstre tommel) |
| Sving | `A` / `D` | styrespak |
| Fly opp / lett | `Mellomrom` | ▲ |
| Fly ned / land | `Shift` | ▼ |
| Se deg rundt | dra med musa, hjul = zoom | dra på høyre side |
| Kvitre | `E` | fugleknappen |
| Musikk av/på | `M` | noteknappen |

Fuglen lander av seg selv når du flyr nedover mot et møbel, en hylle, et
rekkverk eller gulvet. Når den sitter, hopper den med «fremover» og snur seg
med «sving». Hold «opp» for å lette igjen.

## Hva som er med

- Entré, korridor, kjøkken, spisestue (ett trinn ned), stue, musikkrok, trapp
  med repos og loftet med skråtak
- Møbler, planter, bilder, tepper, akvarium med fisk og utsikt mot nabohusene
- Undulat med vingeslag, krenging i svinger, landing, hopping og småvaner når
  den sitter (ser seg rundt, pusser fjær, strekker seg, kvitrer)
- Rolig jazz som improviseres fortløpende (el-piano, kontrabass, visper og
  vibrafon) og fuglelyder, alt syntetisert med Web Audio

Bildene av personer i filmen er byttet ut med nøytrale plassholdere.

## Kode

| Fil | Innhold |
|---|---|
| `src/house.js` | vegger, gulv, vinduer, dører, peis, trapp, loft |
| `src/rooms_main.js`, `src/rooms_other.js` | møbler og ting i hvert rom |
| `src/props.js`, `src/plants.js` | gjenbrukbare deler (bilder, gitarer, hyller, planter) |
| `src/textures.js`, `src/materials.js` | alle teksturer malt på canvas, materialer |
| `src/builder.js` | slår sammen geometri og lager kollisjonsbokser |
| `src/budgie.js`, `src/bird.js` | fuglemodellen og hvordan den flyr, lander og oppfører seg |
| `src/physics.js`, `src/camera.js`, `src/controls.js` | kollisjon, kamera, styring |
| `src/audio.js` | musikk og lyd |
| `build.mjs` | pakker alt til `undulaten.html` (`npm install && npm run build`) |

Three.js ligger i `vendor/` (MIT-lisens).
