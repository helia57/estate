from odoo import http
from odoo.http import request

class EstateWebsite(http.Controller):

    @http.route("/properties", type="http", auth="public", website=True)
    def properties(self, **kwargs):
        # Exemple: on montre new + offer_received + offer_accepted + sold (pas canceled)
        props = request.env["estate.property"].sudo().search(
            [("state", "!=", "canceled")],
            order="id desc",
            limit=60,
        )
        return request.render("estate.website_properties", {"properties": props})
