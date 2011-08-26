from django.contrib import admin

from .models import Figure, ImageMapArea


class ImageMapAreaInline(admin.TabularInline):
    model = ImageMapArea
    extra = 0

class FigureAdmin(admin.ModelAdmin):
    list_display = ("number", "title")
    list_display_links = list_display
    inlines = [ImageMapAreaInline,]
    
    class Media:
        js = [
            'figures/admin.js',
        ]

admin.site.register(Figure, FigureAdmin)
