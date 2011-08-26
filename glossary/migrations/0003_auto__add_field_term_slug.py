# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'Term.slug'
        db.add_column('glossary_term', 'slug', self.gf('django.db.models.fields.SlugField')(db_index=True, default='', max_length=50, blank=True), keep_default=False)


    def backwards(self, orm):
        
        # Deleting field 'Term.slug'
        db.delete_column('glossary_term', 'slug')


    models = {
        'glossary.term': {
            'Meta': {'object_name': 'Term'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '50', 'blank': 'True'}),
            'term': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['glossary']
