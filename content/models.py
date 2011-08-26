from os.path import splitext, basename
from django.conf import settings
from django.core.urlresolvers import reverse
from django.db import models
from django.utils.functional import curry
from onpub.util.markup import formatter
from onpub.util.storage import OverwriteStorage


class VisibleSectionsManager(models.Manager):
    def get_query_set(self):
        return super(VisibleSectionsManager, self).get_query_set().filter(visible=True)


class Section(models.Model):
    number = models.PositiveIntegerField(blank=True, null=True, default=None)
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    text = models.TextField()
    text_html = models.TextField(editable=settings.DEBUG, blank=True)
    figure = models.ForeignKey('figures.Figure', blank=True, null=True)
    scene = models.CharField(max_length=64, blank=True)
    fallback_image = models.ImageField(
                       upload_to=lambda i,f: 'fallback/section-%s%s' % (i.number, splitext(f)[1].lower()),
                       storage=OverwriteStorage(),
                       help_text="cropped PNG image for non-WebGL browsers",
                       blank=True
                     )
    slug = models.SlugField()
    visible = models.BooleanField(default=True)
    
    objects = models.Manager()
    visible_objects = VisibleSectionsManager()
    
    def __unicode__(self):
        return u"%s" % self.title
    
    def get_absolute_url(self):
        if not self.get_previous(): # Home page lives at /
            kwargs = {}
        else:
            kwargs = {"slug": self.slug}
        return reverse("section_detail", kwargs=kwargs)
    
    def _get_next_or_previous_by_number(self, is_next=True):
        op = is_next and "gt" or "lt"
        sections = Section.visible_objects.order_by(is_next and "number" or "-number").filter(**{'number__%s' % op: self.number})
        return sections.count() and sections[0] or None
    
    get_next = curry(_get_next_or_previous_by_number, is_next=True)
    get_previous = curry(_get_next_or_previous_by_number, is_next=False)
    
    def save(self, *args, **kwargs):
        self.text_html = formatter(self.text)
        super(Section, self).save(*args, **kwargs)
    
    class Meta:
        ordering = ("number", "id",)


class Image(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to="images/", help_text="PNG or JPEG image, 550px wide, no border")
    filename = models.CharField(max_length=255, blank=True)
    
    def __unicode__(self):
        return u"%s" % self.title
    
    def save(self, *args, **kwargs):
        self.filename = basename(self.image.name)
        super(Image, self).save(*args, **kwargs)
    
    @property
    def rst_snippet(self):
        return ".. image:: %s" % basename(self.image.name)
