# -*- coding: utf-8 -*-
{
    'name': "Odoo Jalaali 17.1",

    'summary': """
        It will show the jalaali date for most of date fields""",

    'description': """
        
    """,

    'author': "Arash Homayounfar",
    'website': "https://giladoo.com/shop/odoo-jalaali-3",

    # Categories can be used to filter modules in modules listing
    # for the full list
    'category': 'Tools/UI',
    'application': False,
    'version': '17.0.3.0.0',

    # any module necessary for this one to work correctly
    'depends': ['base', 'web'],

    # always loaded
    'assets': {
        'web._assets_core': [
            ('before','web/static/src/core/**/*', 'odoo_jalaali/static/src/js/jalaali-js.js'),
            ('after','web/static/src/core/l10n/dates.js', 'odoo_jalaali/static/src/core/dates_fa.js'),
            ('after','odoo_jalaali/static/src/core/dates_fa.js', 'odoo_jalaali/static/src/core/datetime_picker_fa.js'),
        ],
        'web.assets_backend': [
            ('before','web/static/src/views/**/*', 'odoo_jalaali/static/src/core/calendar_year_renderer_fa.js'),
            ],
        'web.assets_frontend': [
            ('before', 'web/static/src/core/l10n/dates.js', 'odoo_jalaali/static/src/js/jalaali-js.js'),
            ('after', 'web/static/src/core/l10n/dates.js', 'odoo_jalaali/static/src/core/dates_fa.js'),
            ('after', 'odoo_jalaali/static/src/core/dates_fa.js', 'odoo_jalaali/static/src/core/datetime_picker_fa.js'),
        ],
        },
    'license': 'LGPL-3',
}
