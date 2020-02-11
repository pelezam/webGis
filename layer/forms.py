from django.forms import ModelForm, forms
from .models import Zone


class ZoneForm(ModelForm):
    class Meta:
        model = Zone
        fields = '__all__'
