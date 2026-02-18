/** @odoo-module **/

import { reactive } from "@odoo/owl";
import { registry } from "@web/core/registry";

export const counterService = {
    start() {
        const state = reactive({
            count: 0,
        });

        return {
            state,
            increment() {
                state.count++;
            },
            reset() {
                state.count = 0;
            },
        };
    },
};

registry.category("services").add("counter", counterService);

