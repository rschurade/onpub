from django.views.generic import ListView

from .models import Source


class SourceListView(ListView):
    model = Source
