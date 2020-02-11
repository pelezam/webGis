# Generated by Django 2.2.5 on 2020-01-15 11:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('layer', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='historicalzone',
            name='name',
            field=models.CharField(db_index=True, max_length=150),
        ),
        migrations.AlterField(
            model_name='zone',
            name='name',
            field=models.CharField(max_length=150, unique=True),
        ),
    ]