import { ReactNode } from 'react';

export default function PrintLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This overrides the root layout to provide print-specific styling
  return (
    <>
      <div id="print-root">
        {children}
      </div>
      <style jsx global>{`
        @page {
          margin: 1cm;
          size: A4;
        }
        
        * {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        body {
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Inter', sans-serif;
        }
        
        #print-root {
          background: white;
          min-height: 100vh;
        }
        
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          #print-root {
            background: white !important;
          }
          
          /* Nascondi tutti gli elementi tranne il contenuto della stampa */
          body > :not(#print-root) {
            display: none !important;
          }
          
          #print-root > :not(.print-content) {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}