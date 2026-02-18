/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { EstatePropertyCard } from "./estate_property_card";

export class EstatePropertyList extends Component {
    static template = "estate.EstatePropertyList";
    static components = { EstatePropertyCard };

    static props = {
        action: { type: Object, optional: true },
        actionId: { type: Number, optional: true },
        updateActionState: { type: Function, optional: true },
        className: { type: String, optional: true },
    };

    setup() {
        this.orm = useService("orm");
        this.properties = [];

        // ✅ objet = réactivité OWL garantie
        this.state = useState({ selected: {} });

        // ✅ callback bindé
        this.onToggleSelect = (propertyId) => this.toggleSelect(propertyId);

        onWillStart(async () => {
            this.properties = await this.orm.searchRead(
                "estate.property",
                [],
                ["id", "name", "expected_price", "image_main", "state", "property_type_id"]
            );
        });
    }

    toggleSelect(propertyId) {
        if (this.state.selected[propertyId]) {
            delete this.state.selected[propertyId];
        } else {
            this.state.selected[propertyId] = true;
        }
    }

    // ✅ bouton "Clear"
    clearSelection() {
        // on vide l'objet existant (réactif garanti)
        for (const key of Object.keys(this.state.selected)) {
            delete this.state.selected[key];
        }
    }

    get selectedTotal() {
        let total = 0;
        for (const p of this.properties) {
            if (this.state.selected[p.id]) {
                total += p.expected_price || 0;
            }
        }
        return total;
    }

    get selectedCount() {
        return Object.keys(this.state.selected).length;
    }

    get selectedTotalFormatted() {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(this.selectedTotal);
    }

}
