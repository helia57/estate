/** @odoo-module **/

import { registry } from "@web/core/registry";
import { EstatePropertyList } from "../components/estate_property_list";

registry.category("actions").add(
    "estate_owl_demo",
    EstatePropertyList
);
