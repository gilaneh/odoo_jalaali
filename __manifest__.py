# -*- coding: utf-8 -*-
{
    'name': "odoo_jalaali",

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
    'version': '15.0.1.2.7',

    # any module necessary for this one to work correctly
    'depends': ['base', 'web'],
    "external_dependencies": {'python': ['jdatetimext']},

    # always loaded
    'data': [
        'views/settings.xml',
        ],
    'assets': {
        'web._assets_common_scripts': [
            # 'odoo_jalaali/static/src/js/field_utils.js',
            'odoo_jalaali/static/src/js/patch/list_render.js',
            'odoo_jalaali/static/src/js/patch/activity.js',
            'odoo_jalaali/static/src/js/patch/message.js',
            ('after','web/static/src/legacy/js/libs/moment.js', 'odoo_jalaali/static/src/js/moment/moment-jalaali.js'),
            ('after','web/static/src/legacy/js/libs/moment.js', 'odoo_jalaali/static/src/js/jalaali.js'),

            # 'odoo_jalaali/static/src/js/jalaali.js',
            # 'odoo_jalaali/static/src/js/moment/moment-jalaali.js',
            'odoo_jalaali/static/src/js/tempusdominus/tempusdominus_fixed.js',
            # ('replace', 'web/static/lib/owl/owl.js', 'odoo_jalaali/static/src/js/owl/owl.js'),
            # 'odoo_jalaali/static/src/js/owl/owl_fixed.js',
        ],
        'web._assets_common_styles': [
            'odoo_jalaali/static/src/css/fonts_fn.scss',
            # 'odoo_jalaali/static/css/fonts_en.scss',
        ],
        'web.assets_backend': [
            'odoo_jalaali/static/src/css/fonts_web.scss',
            'odoo_jalaali/static/src/js/patch/field_utils.js',
            ],
        'web.assets_frontend': [
            'odoo_jalaali/static/src/css/fonts_front.scss'
            ],
        'web.report_assets_common': [
            'odoo_jalaali/static/src/css/fonts_fn.scss',
            # 'odoo_jalaali/static/css/fonts_en.scss',
            'odoo_jalaali/static/src/css/fonts_report.scss',
            ],
        },
    'license': 'LGPL-3',
}
