# -*- coding: utf-8 -*-
from odoo import models, fields

class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    estate_angry_threshold_ms = fields.Integer(
        string="Estate: Angry threshold (ms)",
        config_parameter="estate.angry_threshold_ms",
        default=20000,
        help="Time on a record before the angry face triggers (in milliseconds).",
    )
