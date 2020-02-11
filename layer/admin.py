from django.contrib import admin
from .models import Layer, Zone
# Register your models here.


class ZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'id', 'created_at', 'updated_at')


class LayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'id', 'zone', 'description', 'created_at')


admin.site.register(Zone, ZoneAdmin)
admin.site.register(Layer, LayerAdmin)
