/** @odoo-module **/

import {
    Component,
    useState,
    useRef,
    useSubEnv,
    onWillStart,
    onMounted,
    onWillUnmount,
    onWillUpdateProps,
} from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const DEFAULT_THRESHOLD_MS = 20_000;

export class EstateCounter extends Component {
    static template = "estate.EstateCounter";

    static props = {
        record: Object,
        readonly: Boolean,
    };

    setup() {
        this.orm = useService("orm");
        this.angryTracer = useService("angry_tracer");
        this.counter = useService("counter");
        this.weather = useService("weather");
        this.angryCounter = useService("angry_counter");

        this.record = this.props.record;

        this.state = useState({
            offerCount: 0,
            loading: true,
            isAngry: false,
            angryThresholdMs: DEFAULT_THRESHOLD_MS,
        });

        this.calculatorInputRef = useRef("calculatorInput");
        useSubEnv({
            focusCalculatorInput: () => {
                this.calculatorInputRef.el?.focus();
            },
        });

        // Timer internals
        this._angryTimer = null;
        this._angryTriggeredOnce = false;

        onWillStart(async () => {
            await this.loadOfferCount();

            // “par jour” : remet à zéro si on a changé de jour
            this.angryCounter.ensureToday?.();

            // Lire le seuil configuré
            await this.loadAngryThresholdFromConfig();

            // Démo météo
            await this.weather.loadWeather("Lyon");
        });

        onMounted(() => {
            this.startAngryTimer();
        });

        onWillUpdateProps(async (nextProps) => {
        const prevId = this.record?.resId;
        const nextId = nextProps?.record?.resId;

        if (prevId !== nextId) {
            // ✅ 1) stoppe l'ancien record AVANT de changer this.record
            if (prevId) {
                this.stopAngryTimer(prevId);
            } else {
                this.stopAngryTimer(); // au cas où
            }

            // ✅ 2) switch record
            this.record = nextProps.record;

            // ✅ 3) recharge les données métier du nouveau record
            await this.loadOfferCount();

            // ✅ 4) ensureToday (si tu veux le faire souvent, ok)
            this.angryCounter.ensureToday?.();

            // ✅ 5) relance le timer sur le nouveau record
            this.startAngryTimer();
        }
    });


        onWillUnmount(() => {
            this.stopAngryTimer();
        });
    }

    // --------------------------------------------------
    // Config: ir.config_parameter
    // --------------------------------------------------
    async loadAngryThresholdFromConfig() {
        try {
            const value = await this.orm.call(
                "ir.config_parameter",
                "get_param",
                ["estate.angry_threshold_ms", String(DEFAULT_THRESHOLD_MS)]
            );

            const parsed = Number.parseInt(value || "", 10);
            this.state.angryThresholdMs = Number.isFinite(parsed)
                ? parsed
                : DEFAULT_THRESHOLD_MS;
        } catch {
            this.state.angryThresholdMs = DEFAULT_THRESHOLD_MS;
        }
    }

    // --------------------------------------------------
    // Angry timer logic
    // --------------------------------------------------
    startAngryTimer() {
        this.stopAngryTimer();

        this._angryTriggeredOnce = false;
        this.state.isAngry = false;

        const resId = this.record?.resId;
        if (!resId) return;

        const threshold = this.state.angryThresholdMs || DEFAULT_THRESHOLD_MS;

        // démarre le chrono “cumul”
        this.angryTracer.start(resId);

        const entry = this.angryTracer.ensure(resId);
        const already = entry.totalMs || 0;

        // Si déjà angry ou déjà au-dessus du seuil -> angry immédiat
        if (entry.isAngry || already >= threshold) {
            this.state.isAngry = true;
            this._angryTriggeredOnce = true;
            if (!entry.isAngry) this.angryTracer.markAngry(resId);
            return;
        }

        // Sinon on attend le temps restant
        const remaining = Math.max(0, threshold - already);

        this._angryTimer = setTimeout(() => {
            if (this._angryTriggeredOnce) return;

            this.state.isAngry = true;
            this._angryTriggeredOnce = true;

            this.angryTracer.markAngry(resId);

            // “par jour” : on compte les déclenchements
            this.angryCounter.increment?.();
        }, remaining);
    }


    stopAngryTimer(resId = null) {
        const id = resId ?? this.record?.resId;
        if (id) {
            // stoppe le cumul de temps pour CE record
            this.angryTracer.stop(id);
        }
        if (this._angryTimer) {
            clearTimeout(this._angryTimer);
            this._angryTimer = null;
        }
    }



    // --------------------------------------------------
    // RPC → Python
    // --------------------------------------------------
    async loadOfferCount() {
        if (!this.record?.resId) return;

        const count = await this.orm.call(
            "estate.property",
            "action_count_offers",
            [this.record.resId]
        );

        this.state.offerCount = count;
        this.state.loading = false;
    }

    // --------------------------------------------------
    // Actions
    // --------------------------------------------------
    incrementCounter() {
        this.counter.increment();
    }

    async onLoadWeather(ev) {
        const city = ev.currentTarget?.dataset?.city;
        if (!city) return;
        await this.weather.loadWeather(city);
    }

    onClickMotivation() {
        this.env.focusCalculatorInput?.();
    }

    // --------------------------------------------------
    // Getters
    // --------------------------------------------------
    get propertyName() {
        return this.record?.data?.name || "—";
    }

    get expectedPrice() {
        return this.record?.data?.expected_price || 0;
    }

    get propertyState() {
        return this.record?.data?.state || "unknown";
    }

    get moodEmoji() {
        if (this.state.isAngry) return "😡";
        const n = this.state.offerCount;
        if (n === 0) return "😐";
        if (n <= 2) return "🙂";
        if (n <= 4) return "😄";
        return "🤩";
    }
    get showWellDone() {
        return this.propertyState === "sold";
    }

    get showCanDoBetter() {
        return this.propertyState !== "sold" && (this.state.offerCount || 0) > 0;
    }


    get isAngry() {
        return this.state.isAngry;
    }
}

registry.category("view_widgets").add("estate_counter", {
    component: EstateCounter,
});
