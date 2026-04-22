import { describe, expect, it } from 'vitest';
import { ICONS } from './icons.js';
import { visualWidth } from './tags.js';

describe('ICONS', () => {
    it('exposes expected names', () => {
        expect(ICONS.check).toBe('✓');
        expect(ICONS.cross).toBe('✗');
        expect(ICONS.warn).toBe('⚠');
    });

    it('composes cleanly into template strings', () => {
        expect(`${ICONS.check} ok`).toBe('✓ ok');
    });

    it('plays nicely with visualWidth', () => {
        expect(visualWidth(`${ICONS.check} ok`)).toBe(visualWidth('✓ ok'));
    });
});
