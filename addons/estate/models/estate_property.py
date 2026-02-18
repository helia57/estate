from odoo import _, api, fields, models
from odoo.exceptions import UserError
from datetime import date, timedelta
from odoo.exceptions import ValidationError


class EstateProperty(models.Model):
    _name = "estate.property"
    _description = "Estate Property"
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = "id desc"
    

    
    # --------------------------------------------------
    # Basic fields
    # --------------------------------------------------
    name = fields.Char(required=True)
    description = fields.Text()
    postcode = fields.Char()
    image_main = fields.Image(string="Photo")


    date_availability = fields.Date(
        copy=False,
        default=lambda self: date.today() + timedelta(days=90)
    )

    
    selling_price = fields.Float(readonly=True, copy=False)

    bedrooms = fields.Integer(default=2)
    living_area = fields.Integer()
    facades = fields.Integer()

   
# --------------------------------------------------
# SQL Constraints
# --------------------------------------------------
    @api.constrains('expected_price')
    def _check_expected_price(self):
        for record in self:
            if record.expected_price <= 0:
                raise ValidationError(
                    _("Expected price must be strictly positive.")
                )


    @api.constrains('selling_price', 'expected_price')
    def _check_selling_price(self):
        for record in self:
            if (
                record.selling_price
                and record.selling_price < 0.9 * record.expected_price
            ):
                raise ValidationError(
                    _(
                        "The selling price cannot be lower than 90% "
                        "of the expected price."
                    )
                )



    # --------------------------------------------------
    # Garden / Garage
    # --------------------------------------------------
    garage = fields.Boolean()
    garden = fields.Boolean()
    garden_area = fields.Integer()
    garden_orientation = fields.Selection(
        [
            ('north', 'North'),
            ('south', 'South'),
            ('east', 'East'),
            ('west', 'West'),
        ],
        string="Garden Orientation"
    )

    # --------------------------------------------------
    # Status & visibility
    # --------------------------------------------------
    active = fields.Boolean(default=True)

    state = fields.Selection(
        [
            ('new', 'New'),
            ('offer_received', 'Offer Received'),
            ('offer_accepted', 'Offer Accepted'),
            ('sold', 'Sold'),
            ('canceled', 'Canceled'),
        ],
        default='new',
        required=True,
        copy=False
    )

    # --------------------------------------------------
    # Relations
    # --------------------------------------------------
    property_type_id = fields.Many2one(
        "estate.property.type",
        string="Property Type"
    )

    buyer_id = fields.Many2one(
        "res.partner",
        string="Buyer",
        readonly=True,
        copy=False
    )

    offer_ids = fields.One2many(
        "estate.property.offer",
        "property_id",
        string="Offers"
    )

    tag_ids = fields.Many2many(
        'estate.property.tag',
        string="Tags"
    )

    expected_selling_rate = fields.Float(
        string="Expected Selling Rate"
    )

    expected_price = fields.Monetary(
        string="Expected Price",
        currency_field="currency_id"
    )

    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id
    )

    salesperson_id = fields.Many2one(
        'res.users',
        string="Salesperson",
        default=lambda self: self.env.user
    )




    # --------------------------------------------------
    # Computed fields
    # --------------------------------------------------
    total_area = fields.Integer(
        string="Total Area",
        compute="_compute_total_area",
        store=True
    )

    best_price = fields.Float(
        string="Best Offer",
        compute="_compute_best_price",
        store=True
    )

    # --------------------------------------------------
    # Onchange
    # --------------------------------------------------
    @api.onchange('garden')
    def _onchange_garden(self):
        if self.garden:
            self.garden_area = 10
            self.garden_orientation = 'north'
        else:
            self.garden_area = False
            self.garden_orientation = False

    @api.onchange('date_availability')
    def _onchange_date_availability(self):
        if self.date_availability and self.date_availability < fields.Date.today():
            return {
                'warning': {
                    'title': _("Date incohérente"),
                    'message': _("La date de disponibilité est antérieure à aujourd'hui.")
                }
            }

    # --------------------------------------------------
    # Compute methods
    # --------------------------------------------------
    @api.depends("living_area", "garden_area")
    def _compute_total_area(self):
        for rec in self:
            rec.total_area = (rec.living_area or 0) + (rec.garden_area or 0)

    @api.depends("offer_ids.price")
    def _compute_best_price(self):
        for rec in self:
            prices = rec.offer_ids.mapped("price")
            rec.best_price = max(prices) if prices else 0.0
      

    # --------------------------------------------------
    # Business Actions
    # --------------------------------------------------
    def action_sold(self):


        for rec in self:
            if rec.state == 'canceled':
                raise UserError("A canceled property cannot be sold.")

            if rec.state != 'offer_accepted':
                raise UserError(
                    _("Only a property with an accepted offer can be sold.")
                )

            rec.state = 'sold'


    def action_cancel(self):


        for rec in self:
            if rec.state == 'sold' and not self.env.user.has_group('base.group_system'):
                raise UserError(
                    _("Only an administrator can cancel a sold property.")
                )
            rec.state = 'canceled'


    def action_reset_offers(self):


        self.ensure_one()

        if not self.env.user.has_group('base.group_system'):
            raise UserError(
                _("Only an administrator can reset offers.")
            )

        if self.state not in ('offer_accepted', 'sold'):
            raise UserError(
                _("You can only reset offers on a sold or accepted property.")
                )

        self.offer_ids.filtered(
            lambda o: o.status == 'accepted'
        ).write({'status': 'new'})

        self.with_context(allow_sold_write=True).write({
            'state': 'new' if not self.offer_ids else 'offer_received',
            'selling_price': False,
            'buyer_id': False,
        })

    # --------------------------------------------------
    # ORM Overrides
    # --------------------------------------------------
    def write(self, vals):
        # Autoriser certaines écritures même si vendu
        allowed_fields = {"image_main", "message_follower_ids", "activity_ids"}

        # Bypass explicite via context (actions internes)
        if self.env.context.get("allow_sold_write"):
            return super().write(vals)

        # Vérification record par record
        for rec in self:
            if rec.state == "sold":
                forbidden = set(vals.keys()) - allowed_fields
                if forbidden:
                    raise ValidationError(
                        _("You cannot modify a sold property.")
                    )

        return super().write(vals)



    def unlink(self):


        for rec in self:
            if rec.state not in ('new', 'canceled'):
                raise UserError(
                    _("You can only delete properties in state 'New'.")
                )
        return super().unlink()



    # --------------------------------------------------
    # OWL / RPC
    # --------------------------------------------------
    def action_count_offers(self):
        """Retourne le nombre d'offres pour ce bien"""
        self.ensure_one()
        return len(self.offer_ids)

