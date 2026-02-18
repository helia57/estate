{
    "name": "Hello World",
    "summary": "Premier module Odoo pour test",
    "description": "Un module simple pour tester le fonctionnement d'Odoo 19.",
    "version": "1.0.0",
    "author": "Elia de Fays",
    "website": "https://www.odoo.com",
    "license": "LGPL-3",
    "category": "Training",
    "depends": ["base"],
    "data": [
        "security/ir.model.access.csv",
        "views/hello_view.xml",
    ],
    "installable": True,
    "application": True,
}
