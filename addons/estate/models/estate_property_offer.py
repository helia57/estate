from datetime import timedelta

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError


class EstatePropertyOffer(models.Model):
    _name = "estate.property.offer"
    _description = "Property Offer"
    _order = "price desc"

    price = fields.Float(
        string="Offer Price",
        required=True
    )

    partner_id = fields.Many2one(
        "res.partner",
        string="Buyer",
        required=True
    )

    property_id = fields.Many2one(
        "estate.property",
        string="Property",
        required=True,
        ondelete="cascade"
    )

    property_type_id = fields.Many2one(
        "estate.property.type",
        string="Property Type",
        related="property_id.property_type_id",
        store=True
    )

    status = fields.Selection(
        [
            ('new', 'New'),
            ('accepted', 'Accepted'),
            ('refused', 'Refused'),
        ],
        default='new',
        required=True,
        copy=False
    )

    validity = fields.Integer(
        string="Validity (days)",
        default=7
    )

    date_deadline = fields.Date(
        string="Deadline",
        compute="_compute_date_deadline",
        inverse="_inverse_date_deadline",
        store=True
    )

    is_low = fields.Boolean(
        compute="_compute_is_low"
    )

    @api.constrains('price')
    def _check_price_positive(self):
        for rec in self:
            if rec.price <= 0:
                raise ValidationError(
                    _("The offer price must be strictly positive.")
                )

    @api.depends('price', 'property_id.expected_price')
    def _compute_is_low(self):
        for offer in self:
            expected = offer.property_id.expected_price
            offer.is_low = bool(
                expected and offer.price < 0.9 * expected
            )

    @api.depends('create_date', 'validity')
    def _compute_date_deadline(self):
        for rec in self:
            create_date = rec.create_date or fields.Datetime.now()
            rec.date_deadline = (
                create_date + timedelta(days=rec.validity)
            ).date()

    def _inverse_date_deadline(self):
        for rec in self:
            if rec.date_deadline:
                create_date = rec.create_date or fields.Datetime.now()
                rec.validity = (
                    rec.date_deadline - create_date.date()
                ).days

    def action_accept(self):
        self.ensure_one()

        if not self.env.user.has_group('estate.estate_admin'):
            raise UserError(
                _("Only an Estate Manager can accept an offer.")
            )

        property_rec = self.property_id

        if (
            property_rec.expected_price
            and self.price < 0.9 * property_rec.expected_price
        ):
            raise UserError(
                _(
                    "The offer is lower than 90% "
                    "of the expected price."
                )
            )

        property_rec.offer_ids.filtered(
            lambda o: o.id != self.id
        ).write({'status': 'refused'})

        self.status = 'accepted'

        property_rec.write({
            'state': 'offer_accepted',
            'selling_price': self.price,
            'buyer_id': self.partner_id,
        })

    def action_refuse(self):
        self.ensure_one()

        if not self.env.user.has_group('base.group_system'):
            raise UserError(
                _("Only an Estate Manager can refuse an offer.")
            )

        self.status = 'refused'

    @api.model_create_multi
    def create(self, vals_list):
        offers = super().create(vals_list)

        for offer in offers:
            property_rec = offer.property_id

            other_prices = property_rec.offer_ids.filtered(
                lambda o: o.id != offer.id
            ).mapped('price')

            if other_prices and offer.price <= max(other_prices):
                raise ValidationError(
                    _("The offer must be higher than existing offers.")
                )

            if property_rec.state == 'new':
                property_rec.state = 'offer_received'
        return offers