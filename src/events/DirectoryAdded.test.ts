import { describe, expect, it } from 'vitest';
import { mockDirectoryAdded, testHook } from '../testing.js';
import { DirectoryAdded } from './DirectoryAdded.js';

describe('DirectoryAdded', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockDirectoryAdded(), () => {
            const input = DirectoryAdded.parse();
            expect(input.directory).toBe('/tmp/other');
            DirectoryAdded.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(mockDirectoryAdded(), () => {
            DirectoryAdded.parse();
            DirectoryAdded.emitOutput({ toUser: 'noted' });
        });
        expect(payload).toEqual({ systemMessage: '\nnoted' });
    });
});
