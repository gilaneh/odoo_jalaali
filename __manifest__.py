{
    'name': 'Odoo Jalaali',
    'version': '18.0.1.0.0',
    'countries': ['ir'],
    'category': 'Localization',
    'description': 'Jalaali datetime fields and datetime picker.',
    'author': 'Arash Homayounfar',
    'website': 'https://giladoo.com/odoo_jalaali',
    'depends': ['web', 'mail'],
    'external_dependencies': {
        'python': ['khayyam'],
    },
    'data': [],
    'demo': [],
    'installable': True,
    'application': False,
    'assets': {
        'web._assets_core': [
            ('after', 'web/static/lib/luxon/luxon.js', 'odoo_jalaali/static/lib/jalaali-js.js'),
            ('after', 'web/static/src/core/**/*', 'odoo_jalaali/static/src/core/l10n/dates_fa.js'),
            'odoo_jalaali/static/src/core/datetime/datetime_picker_fa.js',
        ],
        'web.assets_backend_lazy': [
            ('after', 'mail/static/src/views/web/activity/**', 'odoo_jalaali/static/src/mail/activity_cell.js'),
        ],
        'web.assets_backend': [
            'odoo_jalaali/static/src/views/remaining_days/remaining_days_field.js',
            'odoo_jalaali/static/src/search/**/*',
            ],
        'web.assets_frontend': [
            ('after', 'web/static/lib/luxon/luxon.js', 'odoo_jalaali/static/lib/jalaali-js.js'),
            ('after', 'web/static/src/core/**/*', 'odoo_jalaali/static/src/core/l10n/dates_fa.js'),
            'odoo_jalaali/static/src/core/datetime/datetime_picker_fa.js',


            # 'odoo_jalaali/static/src/core/l10n/dates_fa.js',
            # the following "after" action should be before normal ones
            # should be after the "after action
            # 'odoo_jalaali/static/src/**/*',
        ],
    },
    'license': 'LGPL-3',
}
