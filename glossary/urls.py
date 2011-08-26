from django.conf.urls.defaults import patterns, url

from .views import GlossaryListView, GlossaryDetailView

urlpatterns = patterns('',
    url(r'^$', GlossaryListView.as_view(), name="glossary_list"),
    url(r'^(?P<slug>[^/]+)\.html$', GlossaryDetailView.as_view(), name="glossary_term"),
)
