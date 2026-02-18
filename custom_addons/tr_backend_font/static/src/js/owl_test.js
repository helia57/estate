/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class OwlTest extends Component {
    static template = "tr_backend_font.OwlTest";

    setup() {
        this.state = useState({
            count: 0,
        });
    }

    increment() {
        this.state.count++;
    }
}

registry.category("actions").add("tr_backend_font.owl_test", OwlTest);
