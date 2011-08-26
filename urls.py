from django.conf import settings
from django.conf.urls.defaults import patterns, include, url
from django.utils.importlib import import_module
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^glossary/', include('onpub.glossary.urls')),
    url(r'^sources/', include('onpub.sources.urls')),
    url(r'^', include('onpub.content.urls')),
)


if settings.DEBUG:
    urlpatterns += patterns('', 
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT})
    )


# import rst extensions from installed apps
for app in settings.INSTALLED_APPS:
    try:
        import_module("%s.rstextensions" % app)
    except ImportError:
        pass
