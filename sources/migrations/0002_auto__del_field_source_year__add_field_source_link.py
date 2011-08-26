# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Deleting field 'Source.year'
        db.delete_column('sources_source', 'year')

        # Adding field 'Source.link'
        db.add_column('sources_source', 'link', self.gf('django.db.models.fields.URLField')(default='', max_length=200, blank=True), keep_default=False)


    def backwards(self, orm):
        
        # Adding field 'Source.year'
        db.add_column('sources_source', 'year', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True), keep_default=False)

        # Deleting field 'Source.link'
        db.delete_column('sources_source', 'link')


    models = {
        'sources.source': {
            'Meta': {'object_name': 'Source'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'identifier': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'link': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'unique': 'True', 'max_length': '255', 'blank': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'})
        }
    }

    complete_apps = ['sources']
