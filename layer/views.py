from django.contrib.auth.decorators import login_required
from django.core.serializers import serialize
from django.shortcuts import render, get_object_or_404, redirect
from .forms import ZoneForm
from .models import Zone, Layer
from django.http import JsonResponse, HttpResponse
from layer.utils import shapefile_converter
import pygeoj
import json



@login_required
def add_zone(request):
    zone_form = ZoneForm()
    if request.method == "POST":
        zone_form = ZoneForm(request.POST)
        if zone_form.is_valid():
            zone = zone_form.save()
            # messages.success(request, "L’opération a été effectuée avec succès.")
            data = {'zone': {
                'name': zone.name,
            }}
            return JsonResponse(data)
        else:
            data = {'error': zone_form.errors}
            return JsonResponse(data, status=500)





@login_required
def get_zone(request):
    zones = Zone.objects.prefetch_related('layer_set').all().order_by('name')
    data = []
    if request.method == "GET":
        for zone in zones:
            all_layers = zone.layer_set.all()
            layers = []

            for l in all_layers:
                layers.append({
                    "text": l.name.capitalize(),
                    "id": l.pk,
                })

            item = {
                'text': zone.name,
                'pk': zone.id,
                # 'created_at': zone.created_at.strftime("%d-%m-%Y %H:%M:%S"),
                # 'updated_at': zone.updated_at.strftime("%d-%m-%Y %H:%M:%S"),
                'nodes': layers
            }
            data.append(item)
        return JsonResponse(data, safe=False)


@login_required
def get_layer(request, id):
    if request.is_ajax():
        layer = get_object_or_404(Layer, pk=id)
        data = {"geojson": layer.geojson,
                "id": layer.id,
                "name": layer.name,
                "zone": layer.zone.name,
                "description": layer.description,
                "zone_id": layer.zone.id}
        return JsonResponse(data, safe=False)


@login_required
def add_layer(request):
    if request.method == "POST" and request.FILES['shp_file']:
        layer = None
        zone_id = request.POST.get('zone')
        layer_description = request.POST.get('layer_description')
        libelle = request.POST.get('name')
        try:
            zone = get_object_or_404(Zone, pk=int(zone_id))
        except Zone.DoesNotExist:
            return HttpResponse('la zone n\'existe pas')

        if request.FILES:
            name, geojson = shapefile_converter(request)
            layer = Layer(zone=zone, geojson=geojson, name=libelle, description=layer_description)
            layer.save()
        return redirect('get_zone')


@login_required
def edit_layer(request):
    if request.method == "POST":
        id = request.POST.get('id_layer')
        layer = get_object_or_404(Layer, pk=id)
        zone_id = request.POST.get('zone')
        zone = get_object_or_404(Zone, pk=zone_id)
        libelle = request.POST.get('name')
        description = request.POST.get('layer_description')

        layer.zone = zone
        layer.name = libelle
        layer.description = description
        layer.save()

        return JsonResponse({"response": "ok"})





@login_required
def get_couches(request):
    zones = Zone.objects.all()
    layers = None
    if request.method == "POST":
        zone_id = request.POST.get('zone')
        if zone_id:
            layers = Layer.objects.filter(zone_id=zone_id)
        else:
            layers = Layer.objects.all()
    else:
        layers = Layer.objects.all()
    return render(request, 'layer/couches.html', locals())


@login_required
def get_attributs(request, id):
    layer = get_object_or_404(Layer, pk=id)
    py = pygeoj.load(data=layer.geojson)
    all_attributs_data = []
    for item in py:
        all_attributs_data.append(item.properties)
    attributs = py.all_attributes
    if request.is_ajax():
        # data = {"attributs": attributs, "all_data": all_attributs_data, "layer": layer}
        data = {'attributs': list(attributs),
                "all_data": all_attributs_data,
                "layer": {"id": layer.id,
                          "name": layer.name,
                          "zone": layer.zone.name}
                }
        return JsonResponse(data)
    elif request.method == "GET":
        return render(request, 'layer/couche_attribute_table.html', locals())


@login_required
def delete_layer(request, id):
    layer = get_object_or_404(Layer, pk=id)
    layer.delete()
    return redirect('couches')