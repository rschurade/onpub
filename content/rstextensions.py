import re

from docutils import nodes
from docutils.parsers import rst
from docutils.parsers.rst.directives import images

from .models import Image as ImageModel

def highlight_role(name, rawtext, text, lineno, inliner, options={}, content=[]):
    matches = re.search('([^<]+) ?(?:<(.*)>)?', text).groups()
    text = matches[0].strip()
    term = len(matches) == 2 and matches[1] or matches[0].strip()
    
    return [nodes.raw(rawtext, '<a href="#highlight:%s" class="highlight">%s</a>' % (term, text), format='html')], []

rst.roles.register_canonical_role('highlight', highlight_role)


def scene_role(name, rawtext, text, lineno, inliner, options={}, content=[]):
    matches = re.search('([^<]+) ?(?:<(.*)>)', text).groups()
    text = matches[0].strip()
    scene = matches[1].strip()
    
    return [nodes.raw(rawtext, '<a href="#scene:%s" class="scene">%s</a>' % (scene, text), format='html')], []

rst.roles.register_canonical_role('scene', scene_role)


class Image(images.Image):
    def run(self):
        try:
            img = ImageModel.objects.get(filename=self.arguments[0])
        except:
            raise self.error(
                'Error in "%s" directive: No file found with the name "%s" '
                % (self.name, self.arguments[0])
            )
        self.arguments[0] = img.image.url
        return super(Image, self).run()

rst.directives.register_directive('image', Image)
