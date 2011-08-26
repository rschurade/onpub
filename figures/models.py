# coding: utf-8
from django.core.exceptions import ValidationError
from django.db import models
from onpub.util.markup import formatter


class Figure(models.Model):
    number = models.PositiveIntegerField(blank=True, null=True, default=None)
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to="figures/", help_text="PNG image, 550px wide, no border")
    text = models.TextField(blank=True)
    text_html = models.TextField(editable=False, blank=True)
    
    def __unicode__(self):
        return u"%s. %s" % (self.number, self.title)
    
    def save(self, *args, **kwargs):
        self.text_html = formatter(self.text)
        super(Figure, self).save(*args, **kwargs)
    
    class Meta:
        ordering = ("number", "id",)


class ImageMapArea(models.Model):
    SHAPE_RECT = "rect"
    SHAPE_CIRCLE = "circle"
    SHAPE_POLY = "poly"
    SHAPE_CHOICES = (
        (SHAPE_RECT, "rectangle"),
        (SHAPE_CIRCLE, "circle"),
        (SHAPE_POLY, "polygon"),
    )
    
    ACTION_LINK = 1
    ACTION_SCENE = 2
    ACTION_HIGHLIGHT = 3
    ACTION_CHOICES = (
        (ACTION_LINK, "link"),
        (ACTION_SCENE, "scene"),
        (ACTION_HIGHLIGHT, "highlight")
    )
    
    figure = models.ForeignKey(Figure, related_name="imagemapareas")
    title = models.CharField(max_length=255, blank=True)
    shape = models.CharField(max_length=6, choices=SHAPE_CHOICES)
    coords = models.TextField(max_length=255, help_text="rect: x1,y1,x2,y2 // circle: x,y,r // polygon: x1,y1,x2,y2,…,xn,yn")
    action_type = models.PositiveSmallIntegerField(choices=ACTION_CHOICES, blank=True, null=True)
    action_params = models.CharField(max_length=255, blank=True)
    
    def clean(self):
        self.coords = self.coords.strip()
        if len(self.coords):
            if self.coords[-1] == ',':
                self.coords = self.coords[0:-1]
            the_coords = self.coords.split(',')
            
            for coord in the_coords:
                if not coord.isdigit():
                    raise ValidationError('only numeric coordinates are allow, %s is not numeric' % coord)
            
            if self.shape == 'rect' and len(the_coords) != 4:
                raise ValidationError('coordinates for rectangles need to have the syntax "x1,y1,x2,y2" exactly')
            
            elif self.shape == 'circle' and len(the_coords) != 3:
                raise ValidationError('coordinates for circles need to have the syntax "x,y,r" exactly')
            
            elif self.shape == 'poly':
                if len(the_coords) < 6:
                    raise ValidationError('you need at least 6 coordinates for a polygon – you have %s' % (len(the_coords)))
                if len(the_coords) % 2:
                    raise ValidationError('uneven number of coordinates for polygon – you have %s' % (len(the_coords)))
    
    @property
    def href(self):
        if self.action_type == self.ACTION_LINK:
            return self.action_params
        if self.action_type == self.ACTION_SCENE:
            return '#scene:%s' % self.action_params
        if self.action_type == self.ACTION_HIGHLIGHT:
            return '#highlight:%s' % self.action_params
        return 'javascript:;'
