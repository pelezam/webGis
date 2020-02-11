from django.db import models
import jsonfield
from simple_history.models import HistoricalRecords


class Zone(models.Model):
    name = models.CharField(max_length=150, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.name


class Layer(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(null=True)
    geojson = jsonfield.JSONField()
    zone = models.ForeignKey(Zone, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return "{}-{}".format(self.zone.name, self.name)


