{
    "name": "Estate",
    "summary": "Training Real Estate module",
    "description": """
        Module de formation Odoo 19 :
        - Gestion de biens immobiliers
        - Gestion des offres
        - Workflow métier
        """,
    "version": "19.0.1.0.0",
    "author": "Elia de Fays",
    "website": "https://www.odoo.com",
    "license": "LGPL-3",
    "category": "Training",
    "depends": ["base","web","mail","website"],
    "assets": {
        "web.assets_backend": [
             # Services (avant les composants)
            "estate/static/src/services/angry_tracer_service.js",
            "estate/static/src/services/counter_service.js",
            "estate/static/src/services/weather_service.js",
            "estate/static/src/services/angry_counter_service.js",

            # Widgets / composants
            "estate/static/src/js/estate_counter.js",
            "estate/static/src/js/estate_owl_demo.js",
            "estate/static/src/components/estate_property_card.js",
            "estate/static/src/components/estate_property_list.js",

             # Widgets / composants
            "estate/static/src/xml/estate_counter.xml",
            "estate/static/src/components/estate_property_card.xml",
            "estate/static/src/components/estate_property_list.xml",
        ],
        "web.assets_frontend": [
            "estate/static/src/css/estate_cards.css",
        ],
            "web.assets_web": [
            "estate/static/src/css/estate_cards.css",
        ],

    },
    "data": [
        # Security
        "security/estate_security.xml",
        "security/ir.model.access.csv",

        # Settings (ir.config_parameter)
        "views/res_config_settings_views.xml",

        # Views
        "views/estate_property_offer_views.xml",
        'views/estate_property_type_property_tree.xml',
        "views/estate_property_type_views.xml",
        "views/estate_property_tag_views.xml",
        "views/estate_property_views.xml",
        'views/estate_property_chatter_views.xml',
        "views/estate_owl_action.xml",
        "views/estate_menu.xml",
        "views/website_properties.xml",
        
    ],
    "demo": [
        "demo/demo.xml"
    ],
    "installable": True,
    "application": True
}
