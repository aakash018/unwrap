// The controls shown for a selected element, by its type. Only the editor
// uses this (a type that isn't here has no controls).

import TextSettings from './shared/TextSettings';
import ImageSettings from './image/ImageSettings';
import GiftBoxSettings from './giftbox/GiftBoxSettings';
import LetterSettings from './letter/LetterSettings';
import PolaroidsSettings from './polaroids/PolaroidsSettings';
import VoiceNoteSettings from './voice/VoiceNoteSettings';
import StickyNoteSettings from './sticky/StickyNoteSettings';
import ScratchCardSettings from './scratch/ScratchCardSettings';
import DakshinaSettings from './dakshina/DakshinaSettings';
import SecretSettings from './secret/SecretSettings';
import { EditHint, EventsSettings, DetailsSettings, CoupleSettings } from '../sections/shared/SectionSettings';

export const SETTINGS = {
  heading: TextSettings,
  text: TextSettings,
  image: ImageSettings,
  giftbox: GiftBoxSettings,
  letter: LetterSettings,
  polaroids: PolaroidsSettings,
  voice: VoiceNoteSettings,
  sticky: StickyNoteSettings,
  scratch: ScratchCardSettings,
  dakshina: DakshinaSettings,
  secret: SecretSettings,
  hero: EditHint,
  gardenHero: EditHint,
  events: EventsSettings,
  couple: CoupleSettings,
  details: DetailsSettings,
};
