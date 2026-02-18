/** @odoo-module **/

import { reactive } from "@odoo/owl";
import { registry } from "@web/core/registry";

function now() {
    return Date.now();
}

export const angryTracerService = {
    start() {
        const state = reactive({
            // resId -> { totalMs, startedAt, isAngry, triggeredOnceTodayKey? }
            byRecord: {},
        });

        function ensure(resId) {
            if (!resId) return null;
            if (!state.byRecord[resId]) {
                state.byRecord[resId] = {
                    totalMs: 0,
                    startedAt: null,
                    isAngry: false,
                };
            }
            return state.byRecord[resId];
        }

        function start(resId) {
            const e = ensure(resId);
            if (!e) return;
            if (e.startedAt == null) {
                e.startedAt = now();
            }
        }

        function stop(resId) {
            const e = ensure(resId);
            if (!e) return;
            if (e.startedAt != null) {
                e.totalMs += now() - e.startedAt;
                e.startedAt = null;
            }
        }

        function reset(resId) {
            if (resId) {
                delete state.byRecord[resId];
            }
        }

        return {
            state,
            ensure,
            start,
            stop,
            reset,
            markAngry(resId) {
                const e = ensure(resId);
                if (e) e.isAngry = true;
            },
        };
    },
};

registry.category("services").add("angry_tracer", angryTracerService);
