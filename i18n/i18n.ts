import { I18n } from "i18n-js";
import { en, ru } from "../i18n/supportedLanguages";

const i18n = new I18n({ en, ru });
i18n.fallbacks = true;

export default i18n;