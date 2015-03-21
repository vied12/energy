#! /bin/sh

tiles_destination="src/assets/tiles/"

image1="$1"
image2="$2"
image3="$3"

gdal2tiles.py -p raster -z 0-6 -w none $image1 .tmp/tile1
gdal2tiles.py -p raster -z 0-6 -w none $image2 .tmp/tile2
gdal2tiles.py -p raster -z 0-6 -w none $image3 .tmp/tile3

mkdir $tiles_destination -p
cp -r .tmp/tile1/6/ $tiles_destination
cp -r .tmp/tile1/5/ $tiles_destination
cp -r .tmp/tile2/4/ $tiles_destination
cp -r .tmp/tile3/3/ $tiles_destination
cp -r .tmp/tile3/2/ $tiles_destination
cp -r .tmp/tile3/1/ $tiles_destination
cp -r .tmp/tile3/0/ $tiles_destination

echo "tiles created in $tiles_destination"

# EOF
