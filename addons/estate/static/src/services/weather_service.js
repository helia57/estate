/** @odoo-module **/

import { reactive } from "@odoo/owl";
import { registry } from "@web/core/registry";

export const weatherService = {
    start() {
        const state = reactive({
            loading: false,
            error: null,
            city: null,
            temperature: null,
            windspeed: null,
            time: null,
            lastUpdatedAt: null,
        });

        const CITIES = {
            Paris: { lat: 48.8566, lon: 2.3522 },
            Lyon: { lat: 45.7640, lon: 4.8357 },
            Luxembourg: { lat: 49.6116, lon: 6.1319 },
            Bruxelles: { lat: 50.8476, lon: 4.3572 },
        };

        async function loadWeather(city) {
            const coords = CITIES[city];
            if (!coords) {
                state.error = `Ville inconnue: ${city}`;
                return;
            }

            state.loading = true;
            state.error = null;
            state.city = city;

            try {
                const url =
                    "https://api.open-meteo.com/v1/forecast" +
                    `?latitude=${coords.lat}` +
                    `&longitude=${coords.lon}` +
                    `&current_weather=true`;

                const resp = await fetch(url);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

                const data = await resp.json();
                const cw = data.current_weather;

                state.temperature = cw?.temperature ?? null;
                state.windspeed = cw?.windspeed ?? null;
                state.time = cw?.time ?? null;
                state.lastUpdatedAt = new Date().toISOString();
            } catch (e) {
                state.error = `Impossible de charger la météo (${e.message})`;
                state.temperature = null;
                state.windspeed = null;
                state.time = null;
            } finally {
                state.loading = false;
            }
        }

        return {
            state,
            loadWeather,
            availableCities: Object.keys(CITIES),
        };
    },
};

registry.category("services").add("weather", weatherService);

