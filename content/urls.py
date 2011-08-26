from django.conf.urls.defaults import patterns, url
from django.views.generic.simple import direct_to_template
from .views import IntroductionView, TableOfContentsView, SectionView

urlpatterns = patterns('',
    url(r'^toc\.html$', TableOfContentsView.as_view(), name="toc"),
    url(r'^(?:(?P<slug>[^/]+)\.html)?$', SectionView.as_view(), name="section_detail"),
    url(r'^404/$', direct_to_template, {'template': '404.html'}, name="404"),
)
