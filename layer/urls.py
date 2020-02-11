from django.urls import path
from . import views

urlpatterns = [
    path('add-zone/', views.add_zone, name="add_zone"),
    path('zones/', views.get_zone, name="get_zone"),
    path('<int:id>/', views.get_layer, name="get_layer"),
    path('add/', views.add_layer, name="add_layer"),
    path('edit/', views.edit_layer, name="edit_layer"),
    path('', views.get_couches, name="couches"),
    path('delete/<int:id>/', views.delete_layer, name="delete_layer"),
    path('<int:id>/get_attributs/', views.get_attributs, name="get_attributs"),
]