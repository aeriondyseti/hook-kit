import { describe, expect, it } from 'vitest';
import { mockFileChanged, testHook } from '../testing.js';
import { FileChanged } from './FileChanged.js';

describe('FileChanged', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockFileChanged(), () => {
            const input = FileChanged.parse();
            expect(input.event).toBe('change');
            FileChanged.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps watchPaths', () => {
        const { payload } = testHook(mockFileChanged(), () => {
            FileChanged.parse();
            FileChanged.emitOutput({ watchPaths: ['.envrc'] });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'FileChanged', watchPaths: ['.envrc'] },
        });
    });
});
