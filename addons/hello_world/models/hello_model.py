from odoo import models, fields

class HelloWorld(models.Model):
    _name = "hello.world"
    _description = "Hello World"

    name = fields.Char(string="Name", required=True)
