import { Html, Head, Main, NextScript } from 'next/document';

// _document.js: evita que Chrome/Google Translate traduzcan la UI del
// admin (ej. iniciales de avatar "NM" -> "Nuevo Méjico") y previene el
// crash de React (removeChild/insertBefore) cuando el traductor manipula
// el DOM por fuera de React.
export default function Document() {
  return (
    <Html lang="es" translate="no">
      <Head>
        <meta name="google" content="notranslate" />
      </Head>
      <body className="notranslate">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
