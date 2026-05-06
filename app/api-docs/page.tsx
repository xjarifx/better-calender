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
           color: #e8eaed;
           background-color: #1a1a2e;
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
           color: #e8eaed !important;
         }
         .swagger-ui .opblock-summary-path {
           color: #4285F4 !important;
           font-weight: 600;
         }
         .swagger-ui .opblock-summary-description {
           color: #e8eaed !important;
         }
         .swagger-ui input,
         .swagger-ui select,
         .swagger-ui textarea {
           color: #e8eaed !important;
           background-color: #2a2a3e !important;
           border-color: rgba(255, 255, 255, 0.18) !important;
         }
         .swagger-ui .btn {
           color: #fff !important;
           background-color: #4285F4 !important;
           border-color: #4285F4 !important;
         }
         .swagger-ui .btn:hover {
           background-color: #3367d6 !important;
           border-color: #3367d6 !important;
         }
         .swagger-ui .btn.execute {
           background-color: #4285F4 !important;
         }
         .swagger-ui .btn.authorize {
           background-color: #34A853 !important;
           border-color: #34A853 !important;
         }
         .swagger-ui .btn.authorize:hover {
           background-color: #2d8f47 !important;
           border-color: #2d8f47 !important;
         }
         .swagger-ui .btn.cancel {
           background-color: #EA4335 !important;
           border-color: #EA4335 !important;
         }
         .swagger-ui .btn.cancel:hover {
           background-color: #d33426 !important;
           border-color: #d33426 !important;
         }
         .swagger-ui .opblock-get .opblock-summary-method {
           color: #fff !important;
           background-color: #4285F4 !important;
         }
         .swagger-ui .opblock-post .opblock-summary-method {
           color: #fff !important;
           background-color: #34A853 !important;
         }
         .swagger-ui .opblock-put .opblock-summary-method {
           color: #fff !important;
           background-color: #FBBC04 !important;
         }
         .swagger-ui .opblock-delete .opblock-summary-method {
           color: #fff !important;
           background-color: #EA4335 !important;
         }
         .swagger-ui .dialog-ux .modal-ux-content,
         .swagger-ui .dialog-ux .modal-ux-header {
           background-color: #2a2a3e !important;
           color: #e8eaed !important;
         }
         .swagger-ui .auth-container {
           background-color: #2a2a3e !important;
         }
         .swagger-ui .scheme-container {
           background-color: #1a1a2e !important;
         }
         .swagger-ui .opblock {
           background-color: #2a2a3e !important;
           border-color: rgba(255, 255, 255, 0.18) !important;
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
