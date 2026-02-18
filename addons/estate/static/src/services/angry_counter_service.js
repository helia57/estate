/** @odoo-module **/

import { reactive } from "@odoo/owl";
import { registry } from "@web/core/registry";

function todayKey() {
    // YYYY-MM-DD en local (suffisant pour un “par jour” côté utilisateur)
    return new Date().toISOString().slice(0, 10);
}

export const angryCounterService = {
    start() {
        const state = reactive({
            count: 0,
            dayKey: todayKey(),
        });

        function resetIfNewDay() {
            const key = todayKey();
            if (state.dayKey !== key) {
                state.dayKey = key;
                state.count = 0;
            }
        }

        //  reset automatique à minuit même sans action
        let midnightTimer = null;
        function scheduleMidnightReset() {
            if (midnightTimer) {
                clearTimeout(midnightTimer);
                midnightTimer = null;
            }
            const now = new Date();
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0); // demain 00:00
            midnightTimer = setTimeout(() => {
                resetIfNewDay();
                scheduleMidnightReset(); // replanifie pour le lendemain
            }, nextMidnight - now);
        }
        scheduleMidnightReset();

        return {
            state,

            increment() {
                resetIfNewDay();
                state.count++;
            },

            reset() {
                state.dayKey = todayKey();
                state.count = 0;
            },

            //  depuis un composant (ex: onMounted)
            ensureToday() {
                resetIfNewDay();
            },
        };
    },
};

registry.category("services").add("angry_counter", angryCounterService);
