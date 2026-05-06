import Script from "next/script";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div id="swagger-ui"></div>
      <Script
        src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
      />
      <style>{`
        .swagger-ui {
          color: #3b4157;
        }
        .swagger-ui .info .title,
        .swagger-ui .info h1,
        .swagger-ui .info h2,
        .swagger-ui .info h3,
        .swagger-ui .info h4,
        .swagger-ui .info p,
        .swagger-ui .info table,
        .swagger-ui .opblock-tag,
        .swagger-ui .opblock-summary-method,
        .swagger-ui .opblock-summary-path,
        .swagger-ui .opblock-summary-description,
        .swagger-ui table thead tr th,
        .swagger-ui table tbody tr td,
        .swagger-ui .parameter__name,
        .swagger-ui .parameter__type,
        .swagger-ui .model-title,
        .swagger-ui .model {
          color: #3b4157 !important;
        }
        .swagger-ui .opblock-summary-path {
          color: #3b4157 !important;
          font-weight: 600;
        }
        .swagger-ui .opblock-summary-description {
          color: #3b4157 !important;
        }
        .swagger-ui input,
        .swagger-ui select,
        .swagger-ui textarea {
          color: #3b4157 !important;
          background-color: #fff !important;
          border-color: #d9d9d9 !important;
        }
        .swagger-ui .btn {
          color: #fff !important;
          background-color: #4990e2 !important;
          border-color: #4990e2 !important;
        }
        .swagger-ui .btn:hover {
          background-color: #357abd !important;
          border-color: #357abd !important;
        }
        .swagger-ui .btn.execute {
          background-color: #4990e2 !important;
        }
        .swagger-ui .btn.authorize {
          background-color: #49cc90 !important;
          border-color: #49cc90 !important;
        }
        .swagger-ui .btn.authorize:hover {
          background-color: #3daf78 !important;
          border-color: #3daf78 !important;
        }
        .swagger-ui .btn.cancel {
          background-color: #f93e3e !important;
          border-color: #f93e3e !important;
        }
        .swagger-ui .btn.cancel:hover {
          background-color: #e03131 !important;
          border-color: #e03131 !important;
        }
        .swagger-ui .opblock-get .opblock-summary-method {
          color: #fff !important;
          background-color: #61affe !important;
        }
        .swagger-ui .opblock-post .opblock-summary-method {
          color: #fff !important;
          background-color: #49cc90 !important;
        }
        .swagger-ui .opblock-put .opblock-summary-method {
          color: #fff !important;
          background-color: #fca130 !important;
        }
        .swagger-ui .opblock-delete .opblock-summary-method {
          color: #fff !important;
          background-color: #f93e3e !important;
        }
        .swagger-ui .dialog-ux .modal-ux-content,
        .swagger-ui .dialog-ux .modal-ux-header {
          background-color: #fff !important;
          color: #3b4157 !important;
        }
        .swagger-ui .auth-container {
          background-color: #fff !important;
        }
        .swagger-ui .scheme-container {
          background-color: #f7f7f7 !important;
        }
      `}</style>
      <Script
        id="swagger-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.onload = function() {
              SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIStandalonePreset
                ],
              });
            }
          `,
        }}
      />
    </div>
  );
}
