# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'ImageMapArea'
        db.create_table('figures_imagemaparea', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('figure', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['figures.Figure'])),
            ('shape', self.gf('django.db.models.fields.CharField')(max_length=6)),
            ('coords', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('action_type', self.gf('django.db.models.fields.PositiveSmallIntegerField')()),
            ('action_params', self.gf('django.db.models.fields.CharField')(max_length=255)),
        ))
        db.send_create_signal('figures', ['ImageMapArea'])


    def backwards(self, orm):
        
        # Deleting model 'ImageMapArea'
        db.delete_table('figures_imagemaparea')


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
            'action_params': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'action_type': ('django.db.models.fields.PositiveSmallIntegerField', [], {}),
            'coords': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'figure': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['figures.Figure']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'shape': ('django.db.models.fields.CharField', [], {'max_length': '6'})
        }
    }

    complete_apps = ['figures']
