# -*- coding: utf-8 -*-
{
    'name': "Odoo Jalaali 18",

    'summary': """
        It will show the jalaali date for most of date fields""",

    'description': """
        
    """,

    'author': "Arash Homayounfar",
    'website': "https://gilaneh.com/shop/odoo-jalaali-date-1",

    # Categories can be used to filter modules in modules listing
    # for the full list
    'category': 'Service Desk/Service Desk',
    'application': False,
    'version': '18.0.0.0.0',

    # any module necessary for this one to work correctly
    'depends': ['base', 'web'],

    # always loaded
    'data': [
        # 'views/settings.xml',
        ],
    'assets': {
        'web._assets_common_scripts': [

        ],
        'web._assets_core': [
            # ('before','web/static/src/core/**/*', 'odoo_jalaali/static/src/js/jalaali-js.js'),
            # ('after','web/static/src/core/l10n/dates.js', 'odoo_jalaali/static/src/core/dates_fa.js'),
            # ('after','odoo_jalaali/static/src/core/dates_fa.js', 'odoo_jalaali/static/src/core/datetime_picker_fa.js'),

        ],
        'web._assets_common_styles': [
            'odoo_jalaali/static/src/css/fonts_fn.scss',
            # 'odoo_jalaali/static/css/fonts_en.scss',
        ],
        'web.assets_backend': [
            'odoo_jalaali/static/src/css/fonts_web.scss',
            # ('before','web/static/src/views/**/*', 'odoo_jalaali/static/src/core/calendar_year_renderer_fa.js'),

            ],
        'web.assets_frontend': [
            'odoo_jalaali/static/src/css/fonts_front.scss',
            # ('before', 'web/static/src/core/l10n/dates.js', 'odoo_jalaali/static/src/js/jalaali-js.js'),
            # ('after', 'web/static/src/core/l10n/dates.js', 'odoo_jalaali/static/src/core/dates_fa.js'),
            # ('after', 'odoo_jalaali/static/src/core/dates_fa.js', 'odoo_jalaali/static/src/core/datetime_picker_fa.js'),

        ],
        'web.report_assets_common': [
            'odoo_jalaali/static/src/css/fonts_fn.scss',
            'odoo_jalaali/static/src/css/fonts_report.scss',
            ],
        },
    'license': 'LGPL-3',
}
