import { describe, expect, it } from 'vitest';
import { mockPostCompact, testHook } from '../testing.js';
import { PostCompact } from './PostCompact.js';

describe('PostCompact', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockPostCompact(), () => {
            const input = PostCompact.parse();
            expect(input.compact_summary).toBe('test summary');
            PostCompact.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(mockPostCompact(), () => {
            PostCompact.parse();
            PostCompact.emitOutput({ toUser: 'noted' });
        });
        expect(payload).toEqual({ systemMessage: '\nnoted' });
    });
});
