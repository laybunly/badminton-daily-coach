// Link to the static privacy page (public/datenschutz.html), opened in the current language.
import { LANG } from '../state';

const LABEL = { de: 'Datenschutz', en: 'Privacy', fr: 'Confidentialité' } as const;
export function privacyLink(cls: string): string {
  return `<a class="privlink ${cls}" href="./datenschutz.html#${LANG}">${LABEL[LANG]}</a>`;
}
