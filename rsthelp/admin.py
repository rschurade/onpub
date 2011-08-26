from django.contrib import admin
from django.conf.urls.defaults import patterns, url
from django.template.defaultfilters import force_escape
from django.views.generic import ListView

from .models import Item


class ReferenceView(ListView):
    template_name = "admin/rsthelp/reference.html"
    model = Item
    
    def get_context_data(self, **kwargs):
        context_data = super(ReferenceView, self).get_context_data(**kwargs)
        context_data['is_popup'] = True # '_popup' in self.request.GET
        return context_data


class ItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'get_code', 'get_code_html', 'order',)
    list_editable = ('title', 'order',)
    
    def get_code(self, instance):
        return u"<tt>%s</tt>" % force_escape(instance.code)
    get_code.allow_tags = True
    get_code.short_description = "Code"
    
    def get_code_html(self, instance):
        return instance.code_html
    get_code_html.allow_tags = True
    get_code_html.short_description = "HTML"
    
    def get_urls(self):
        urls = super(ItemAdmin, self).get_urls()
        my_urls = patterns('',
            url(r'^reference/$', ReferenceView.as_view(), name="rst_reference"),
        )
        return my_urls + urls
    
    class Media:
        css = {
            "all": ("stylesheets/admin.css",)
        }
        js = (
            "javascripts/admin.js",
        )
    
admin.site.register(Item, ItemAdmin)
