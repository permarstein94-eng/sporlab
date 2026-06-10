/* Globale typedeklarasjoner for tsc-sjekken (`npx tsc -p jsconfig.json`).
   Kun typer — ingen kjøretidskode, og filen lastes ikke i nettleseren. */

/* assets/qrcode.js har en UMD-wrapper som nevner module.exports, så tsc
   behandler filen som modul og ser ikke `var qrcode` som global. Appen
   bruker den som global (typeof-vaktet i renderPlanQr), så den deklareres her. */
declare function qrcode(
  typeNumber: number,
  errorCorrectionLevel: string
): {
  addData(data: string): void;
  make(): void;
  createSvgTag(opts: {
    cellSize?: number;
    margin?: number;
    scalable?: boolean;
    title?: string;
  }): string;
};

/* Appens delegerte event-handlere bruker event.target direkte
   (closest/id/value); DOM-typene gir bare EventTarget. Medlemmene utvides
   her én gang i stedet for å kaste typer på ~45 steder i app.js. */
interface EventTarget {
  closest(selectors: string): HTMLElement | null;
  id: string;
  value: string;
}
