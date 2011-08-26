from django.conf.urls.defaults import patterns, url

from .views import SourceListView

urlpatterns = patterns('',
    url(r'^$', SourceListView.as_view(), name="source_list"),
)
