# coding: utf-8
import os.path
from django import forms
from django.conf import settings
from django.utils import simplejson

class SectionAdminForm(forms.ModelForm):
    scene = forms.ChoiceField()
    
    def __init__(self, *args, **kwargs):
        super(SectionAdminForm, self).__init__(*args, **kwargs)
        scene_choices = [('', u"Scene …")]
        
        data_file = open(os.path.join(settings.PROJECT_STATIC_ROOT, 'data', 'scenes.json'))
        scene_data = simplejson.load(data_file)
        data_file.close()
        for scene in scene_data:
            scene_choices.append((scene['id'], scene['id']))
        
        self.fields['scene'].choices = scene_choices
