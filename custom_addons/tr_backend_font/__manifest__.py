{
    "name": "TR Backend Font",
    "author": "Elia de Fays",
    "summary": "Change backend font to Oswald",
    "version": "19.0.1.0.0",
    "category": "Technical",
    "license": "LGPL-3",
    "depends": ["web"],
    "application": True,
    "data": [
        "views/owl_menu.xml",
    ],
    "assets": {
        "web.assets_backend": [
            #"tr_backend_font/static/src/css/backend_font.css",
            "tr_backend_font/static/src/js/owl_test.js",
            "tr_backend_font/static/src/xml/owl_test.xml",
        ],
    },
    "installable": True,
}
