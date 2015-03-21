# Energiesystem Stadt

_DIE INFORMATIONSARCHITEKTUR DER KOMMUNALEN ENERGIEWENDE_

## Presentation

Eine interaktive Infografik für kommunale Entscheidungsträger und Stadtplaner.  

Die Infografik gibt einen Überblick über für die Planung und Umsetzung relevante Themenfelder und stellt die zur Stadtraumtypisierung und energetischen Bilanzierung erforderlichen Daten und Informationen bereit. Die Navigation erfolgt wahlweise über die integrierte Zoomfunktion oder über die Navigationsleiste.  

Entwickelt und umgesetzt im Rahmen des interdisziplinären Forschungsprojektes "Techniken und Strukturen zur Realisation von Energieeffizienz in der Stadt (TestReal)" an der Bauhaus-Universität Weimar. 

## How to install

Requirements: `node` and `npm`.

Then run

```
npm -g install bower
npm install
bower install
gulp serve
```

## How to create tiles from pictures

First you need [GDAL - Geospatial Data Abstraction Library ](http://www.gdal.org/index.html).  
You can install it on Ubuntu with: `sudo apt-get install gdal-bin`

Then create the tiles like that:
```
./scripts/create_tiles.sh [paths to your 3 images]
```
ex:
```
./scripts/create_tiles.sh image_zoom_level1.png image_zoom_level2.png image_zoom_level3.png
```
where `image_zoom_level1.png` is the image with the less detailed infographic for the firsts zooms.

It will create a `tiles/` folder in `src/assets/`
