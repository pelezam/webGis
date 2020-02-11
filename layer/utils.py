import zipfile
import geopandas as gpd
from django.core.files.storage import FileSystemStorage
import json
import os
import shutil
from pathlib import Path
from django.shortcuts import HttpResponse
import glob


def shapefile_converter(request):

    """ :return filename and geojson"""
    file = request.FILES['shp_file']
    fs = FileSystemStorage()
    name = fs.save(file.name, file)
    file_url = fs.url(name)

    if Path('media/' + name).suffix in ['.zip']:
        zip_file = zipfile.ZipFile("media/" + name)
        zip_file.extractall("media/tmp/")
        if glob.glob('media/tmp/*.shp'):
            shape_file_name = glob.glob('media/tmp/*.shp')[0]
            shape_file = gpd.read_file(shape_file_name)
            shape_file.to_file("media/import.json", driver="GeoJSON")

            if glob.glob("media/import.json"):
                with open("media/import.json", 'r', encoding="utf-8") as f:
                    data = json.load(f)
            else:
                return HttpResponse("L'importation à échouer")

        else:
            return HttpResponse('aucun fichier shape trouvé')
    else:
        return HttpResponse("Le format est incorrect")

    try:
        os.remove("media/" + name)
        os.remove("media/import.json")
        shutil.rmtree("media/tmp/")
    except FileNotFoundError:
        pass
    filename = file.name.split('.')[0]
    return filename, data
