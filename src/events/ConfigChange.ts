/**
 * ConfigChange — runs when a settings file or skill changes on disk during a
 * session.
 *
 * Set `deny: true` to keep the change from taking effect in this session
 * (e.g. an unreviewed edit that loosens permissions). Changes to
 * `policy_settings` can't be blocked.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface ConfigChangeInput extends RawHookInput<'ConfigChange'> {
    source: 'user_settings' | 'project_settings' | 'local_settings' | 'policy_settings' | 'skills';
    file_path?: string;
}

export interface ConfigChangeEmitOptions extends CommonEmitOptions {
    /** Reject the change. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; explains why. */
    reason?: string;
}

interface ConfigChangeJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
}

export class ConfigChange {
    static parse(): ConfigChangeInput {
        return readHookInput('ConfigChange') as ConfigChangeInput;
    }

    static emitOutput(opts: ConfigChangeEmitOptions = {}): never {
        const out = mixinCommon<ConfigChangeJsonOutput>({}, opts);
        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;
        return emitJson(out);
    }
}
