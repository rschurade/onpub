from classytags.core import Options
from classytags.arguments import Argument
from classytags.helpers import AsTag
from django import template

from ..models import Section

register = template.Library()

class GetSections(AsTag):
    options = Options(
        'as',
        Argument('varname', resolve=False, required=True),
    )

    def get_value(self, context):
        return Section.objects.all()

register.tag(GetSections)
