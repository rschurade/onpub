# coding: utf-8
from django.contrib import admin

from .forms import SectionAdminForm
from .models import Section, Image


class SectionAdmin(admin.ModelAdmin):
    list_display = ("number", "title", "scene", "visible", "link",)
    list_display_links = ("number", "title",)
    prepopulated_fields = {"slug": ("title",)}
    form = SectionAdminForm
    ordering = ("number", "id",)
    actions = ["show", "hide"]
    
    def link(self, instance):
        return u'<a href="%s" target="mpifb">››› View on website</a>' % instance.get_absolute_url()
    link.allow_tags = True
    
    def show(self, request, queryset):
        queryset.update(visible=True)
    show.short_description = "Show selected sections"
    
    def hide(self, request, queryset):
        queryset.update(visible=False)
    hide.short_description = "Hide selected sections"
    
    class Media:
        css = {
            "all": ("stylesheets/admin.css",)
        }
        js = (
            "javascripts/admin.js",
        )

admin.site.register(Section, SectionAdmin)


class ImageAdmin(admin.ModelAdmin):
    list_display = ("title", "thumbnail", "rst_snippet",)
    
    def rst_snippet(self, instance):
        return u"<tt>%s</tt>" % instance.rst_snippet
    rst_snippet.short_description = "code snippet"
    rst_snippet.allow_tags = True
    
    def thumbnail(self, instance):
        return u'<img src="%s" style="max-width: 240px; max-height: 240px;" />' % instance.image.url
    thumbnail.allow_tags = True

admin.site.register(Image, ImageAdmin)
