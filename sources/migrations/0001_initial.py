# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Source'
        db.create_table('sources_source', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('identifier', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('text', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('year', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('slug', self.gf('django.db.models.fields.SlugField')(db_index=True, unique=True, max_length=255, blank=True)),
        ))
        db.send_create_signal('sources', ['Source'])


    def backwards(self, orm):
        
        # Deleting model 'Source'
        db.delete_table('sources_source')


    models = {
        'sources.source': {
            'Meta': {'object_name': 'Source'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'identifier': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'slug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'unique': 'True', 'max_length': '255', 'blank': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'year': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['sources']
