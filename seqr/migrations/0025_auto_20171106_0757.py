# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-11-06 07:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('seqr', '0024_auto_20171101_2354'),
    ]

    operations = [
        migrations.AddField(
            model_name='family',
            name='coded_phenotype',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='family',
            name='post_discovery_omim_number',
            field=models.TextField(blank=True, null=True),
        ),
    ]