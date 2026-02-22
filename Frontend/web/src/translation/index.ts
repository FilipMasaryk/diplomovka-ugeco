import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import sk from "./countries/sk.json";
import cz from "./countries/cz.json";
import pl from "./countries/pl.json";
import de from "./countries/de.json";
import hu from "./countries/hu.json";
import eng from "./countries/eng.json";
i18n.use(initReactI18next).init({
  resources: {
    SK: { translation: sk },
    CZ: { translation: cz },
    PL: { translation: pl },
    DE: { translation: de },
    HU: { translation: hu },
    AT: { translation: de },
    GB: { translation: eng },
  },
  lng: "SK",
  fallbackLng: "SK",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
