import { describe, expect, it } from 'vitest';
import { parseBody } from './academie';

describe('parseBody', () => {
  it('reconnaît titres, puces et paragraphes', () => {
    expect(parseBody('# Objectifs\r\n- Nettoyer\n• Apaiser\n\nTexte libre')).toEqual([
      { kind: 'h', text: 'Objectifs' }, { kind: 'li', text: 'Nettoyer' }, { kind: 'li', text: 'Apaiser' }, { kind: 'p', text: 'Texte libre' },
    ]);
  });
  it('ignore les lignes vides', () => { expect(parseBody('\n  \n')).toEqual([]); });
});
