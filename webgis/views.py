from django.contrib.auth.decorators import login_required
from django.shortcuts import render, HttpResponse


@login_required
def home(request):
    return render(request, 'tableau-de-bord.html')


@login_required
def profile(request):
    return render(request, 'profile.html', locals())