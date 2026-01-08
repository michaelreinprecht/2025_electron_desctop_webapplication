const Store = require('electron-store');

const schema = {
    charts: {
        type: "object",
        additionalProperties: {
            type: "object",
            properties: {
                label: { type: "string" },
                yLabel: { type: "string" },
                maxPoints: { type: "number" },
                color: { type: "string" },
                yMin: { type: ["number", "null"] },
                yMax: { type: ["number", "null"] }
            }
        }
    }
};

const store = new Store({
    name: "chart-settings",
    schema,
    defaults: { charts: {} }
});

module.exports = store;
