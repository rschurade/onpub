# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'ImageMapArea.title'
        db.add_column('figures_imagemaparea', 'title', self.gf('django.db.models.fields.CharField')(default='', max_length=255, blank=True), keep_default=False)

        # Changing field 'ImageMapArea.coords'
        db.alter_column('figures_imagemaparea', 'coords', self.gf('django.db.models.fields.TextField')(max_length=255))


    def backwards(self, orm):
        
        # Deleting field 'ImageMapArea.title'
        db.delete_column('figures_imagemaparea', 'title')

        # Changing field 'ImageMapArea.coords'
        db.alter_column('figures_imagemaparea', 'coords', self.gf('django.db.models.fields.CharField')(max_length=255))


    models = {
        'figures.figure': {
            'Meta': {'ordering': "('number', 'id')", 'object_name': 'Figure'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'number': ('django.db.models.fields.PositiveIntegerField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'text_html': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'figures.imagemaparea': {
            'Meta': {'object_name': 'ImageMapArea'},
            'action_params': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'action_type': ('django.db.models.fields.PositiveSmallIntegerField', [], {'blank': 'True'}),
            'coords': ('django.db.models.fields.TextField', [], {'max_length': '255'}),
            'figure': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'imagemapareas'", 'to': "orm['figures.Figure']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'shape': ('django.db.models.fields.CharField', [], {'max_length': '6'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'})
        }
    }

    complete_apps = ['figures']
