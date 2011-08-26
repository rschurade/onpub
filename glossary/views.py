from django.views.generic import ListView, DetailView

from .models import Term


class TermMixin(object):
    queryset = Term.objects.filter(active=True)


class GlossaryListView(TermMixin, ListView):
    pass


class GlossaryDetailView(TermMixin, DetailView):
    pass
