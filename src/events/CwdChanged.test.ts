import { describe, expect, it } from 'vitest';
import { mockCwdChanged, testHook } from '../testing.js';
import { CwdChanged } from './CwdChanged.js';

describe('CwdChanged', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockCwdChanged(), () => {
            const input = CwdChanged.parse();
            expect(input.new_cwd).toBe('/tmp/sub');
            CwdChanged.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps watchPaths', () => {
        const { payload } = testHook(mockCwdChanged(), () => {
            CwdChanged.parse();
            CwdChanged.emitOutput({ watchPaths: ['.envrc'] });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'CwdChanged', watchPaths: ['.envrc'] },
        });
    });
});
