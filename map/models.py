from django.db import models
import jsonfield
# Create your models here.


class Map(models.Model):
    libelle = models.CharField(max_length=255)
    map = jsonfield.JSONField()
    legende = jsonfield.JSONField()
    
    def __str__(self):
        return self.libelle


class diffusion(models.Model):
    pass