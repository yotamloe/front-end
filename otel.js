// browserify me -> browserify otel.js -o public/js/otel.js
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
const { DocumentLoadInstrumentation } = require('@yotamloe/instrumentation-document-load') ;
const { ZoneContextManager } = require('@opentelemetry/context-zone');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
// or if you already have zone.js
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes, SemanticAttributes } = require('@opentelemetry/semantic-conventions');
const { UserInteractionInstrumentation } = require('@opentelemetry/instrumentation-user-interaction');
const { XMLHttpRequestInstrumentation } = require('@opentelemetry/instrumentation-xml-http-request') ;
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const fetch = require('sync-fetch')

const exporter = new OTLPTraceExporter({
    url: 'http://52.154.163.54:4318/v1/traces',
});

const parseCookie = str =>
    str
        .split(';')
        .map(v => v.split('='))
        .reduce((acc, v) => {
            acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
            return acc;
        }, {});

const pageCookie = parseCookie(document.cookie);

const provider = new WebTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'sockshop' + window.location.pathname,
        ["session.id"]: pageCookie.sid,
        [SemanticAttributes.NET_PEER_IP]: fetch('https://api.ipify.org?format=json').json().ip,
    }),
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register({
    contextManager: new ZoneContextManager()
});

registerInstrumentations({
    instrumentations: [
        new UserInteractionInstrumentation({
            propagateTraceHeaderCorsUrls: [
                /.+/g,
            ],
        },),
        new DocumentLoadInstrumentation({
            propagateTraceHeaderCorsUrls: [
                /.+/g,
            ],
        },),
        new XMLHttpRequestInstrumentation({
            propagateTraceHeaderCorsUrls: [
                /.+/g,
            ],
        }),
    ],
});
