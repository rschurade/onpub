# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Term'
        db.create_table('glossary_term', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('term', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('description', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal('glossary', ['Term'])


    def backwards(self, orm):
        
        # Deleting model 'Term'
        db.delete_table('glossary_term')


    models = {
        'glossary.term': {
            'Meta': {'object_name': 'Term'},
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'term': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['glossary']
