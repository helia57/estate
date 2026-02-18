/** @odoo-module **/

import { Component, useRef } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class EstatePropertyCard extends Component {
    static template = "estate.EstatePropertyCard";

    static props = {
        property: Object,
        selected: { type: Boolean, optional: true },
        onToggleSelect: { type: Function, optional: true },
        onReload: { type: Function, optional: true },
        readonly: { type: Boolean, optional: true },  
    };

    setup() {
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.fileInputRef = useRef("fileInput");
    }

    // 🔘 Click sur "Ajouter une photo" / "Modifier"
    onUploadClick() {
        this.fileInputRef.el?.click();
    }

    onToggleSelectClick(ev) {
        ev.stopPropagation();
        this.props.onToggleSelect?.();
    }

    // 🗑️ Supprimer la photo
    async onDeletePhotoClick(ev) {
        ev?.stopPropagation?.();

        try {
            await this.orm.write("estate.property", [this.props.property.id], {
                image_main: false,
            });

            this.notification.add("Photo supprimée ✔", { type: "success" });

            // ✅ recharge parent pour refléter l'image supprimée
            this.props.onReload?.();
        } catch (err) {
            this.notification.add("Erreur lors de la suppression de la photo", {
                type: "danger",
            });
            console.error(err);
        }
    }

    // 📂 Fichier sélectionné
    async onFileSelected(ev) {
        const file = ev.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async () => {
            const result = reader.result || "";
            const base64 = String(result).split(",")[1];

            try {
                await this.orm.write("estate.property", [this.props.property.id], {
                    image_main: base64,
                });

                this.notification.add("Photo chargée avec succès ✔", {
                    type: "success",
                });

                // reset input (sinon re-choisir le même fichier ne déclenche pas toujours change)
                if (this.fileInputRef.el) {
                    this.fileInputRef.el.value = "";
                }

                // ✅ recharge parent pour refléter la nouvelle image
                this.props.onReload?.();
            } catch (err) {
                this.notification.add("Erreur lors du chargement de la photo", {
                    type: "danger",
                });
                console.error(err);
            }
        };

        reader.readAsDataURL(file);
    }

    // 🟢 "Well Done!" si vendue/acceptée
    get showWellDone() {
        return ["sold", "offer_accepted"].includes(this.props.property.state);
    }

    // 🔴 "You can do better!" si offre reçue
    get showCanDoBetter() {
        return this.props.property.state === "offer_received";
    }

    get propertyTypeName() {
        return this.props.property.property_type_id?.[1] || "";
    }

    get propertyTypeKey() {
        return this.propertyTypeName.toLowerCase();
    }

    get typeIcon() {
        const t = this.propertyTypeKey;
        if (t.includes("maison")) return "fa-home";
        if (t.includes("appartement")) return "fa-building";
        return "fa-tag";
    }

    get typeClass() {
        const t = this.propertyTypeKey;
        if (t.includes("maison")) return "estate_type--house";
        if (t.includes("appartement")) return "estate_type--apartment";
        return "estate_type--other";
    }

    // 🎨 Couleur de carte selon l'état
    get cardClass() {
        const st = this.props.property.state;
        if (st === "sold") return "estate_card--sold";
        if (st === "offer_received") return "estate_card--offer_received";
        if (st === "offer_accepted") return "estate_card--offer_accepted";
        if (st === "canceled") return "estate_card--canceled";
        return "estate_card--default";
    }
}
