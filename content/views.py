from django.http import Http404
from django.views.generic import ListView, DetailView, TemplateView

from .models import Section


class SectionMixin(object):
    queryset = Section.visible_objects.all()


class IntroductionView(TemplateView):
    template_name = "content/intro.html"


class TableOfContentsView(SectionMixin, ListView):
    template_name = "content/toc.html"


class SectionView(SectionMixin, DetailView):
    def get_object(self, queryset=None):
        try:
            obj = super(SectionView, self).get_object(queryset)
        except AttributeError:
            if queryset is None:
                queryset = self.get_queryset()
            try:
                obj = queryset.all()[0]
            except IndexError:
                raise Http404
        return obj
    
    def get_context_data(self, **kwargs):
        context = super(SectionView, self).get_context_data(**kwargs)
        context['previous'] = self.object.get_previous()
        context['next'] = self.object.get_next()
        if 'noviewer' in self.request.GET:
            context['noviewer'] = True
        return context
