/**
 * PreModelSwitch — runs before a model change takes effect.
 *
 * Same decision contract as `PreToolUse`: `allow` proceeds (skipping the
 * interactive cache-miss confirmation), `deny` cancels the switch, `ask`
 * asks the user (treated as deny where nobody can answer). The input carries
 * what the switch will cost — a switch forfeits the prompt cache, so
 * `estimated_cache_write_usd` is what re-caching `context_tokens` will run.
 */

import { hasHookSpecificFields, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

/** Fields shared by `PreModelSwitch` and `PostModelSwitch`. */
export interface ModelSwitchInfo {
    /** Resolved model id before the switch. */
    from_model: string;
    /** Resolved model id after the switch. */
    to_model: string;
    /** What was asked for (an alias like `opus`, a full id, or `null` for the default). */
    requested_model: string | null;
    /** Prompt tokens the next request re-sends. */
    context_tokens: number;
    /** Whether the current model's prompt cache is likely still warm (a switch forfeits it). */
    prompt_cache_warm: boolean;
    cache_ttl: '5m' | '1h';
    /** Estimated cost of re-caching `context_tokens` on `to_model`. */
    estimated_cache_write_usd: number;
    /** How the estimate was priced: org-configured pricing, list price, or a default tier for an unknown model. */
    pricing: 'configured' | 'catalog' | 'default';
}

export interface PreModelSwitchInput extends RawHookInput<'PreModelSwitch'>, ModelSwitchInfo {
    /** `command` = `/model` or config, `picker` = the model picker, `sdk` = headless `set_model`. */
    source: 'command' | 'picker' | 'sdk';
}

export interface PreModelSwitchEmitOptions extends CommonEmitOptions {
    /** allow / deny / ask. Maps to `hookSpecificOutput.permissionDecision`. */
    decision?: 'allow' | 'deny' | 'ask';
    /** Explanation shown alongside the decision. */
    reason?: string;
}

interface PreModelSwitchHookSpecific {
    hookEventName: 'PreModelSwitch';
    permissionDecision?: 'allow' | 'deny' | 'ask';
    permissionDecisionReason?: string;
}

interface PreModelSwitchJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: PreModelSwitchHookSpecific;
}

export class PreModelSwitch {
    static parse(): PreModelSwitchInput {
        return readHookInput('PreModelSwitch') as PreModelSwitchInput;
    }

    static emitOutput(opts: PreModelSwitchEmitOptions = {}): never {
        const out = mixinCommon<PreModelSwitchJsonOutput>({}, opts);
        const hs: PreModelSwitchHookSpecific = { hookEventName: 'PreModelSwitch' };
        if (opts.decision !== undefined) hs.permissionDecision = opts.decision;
        if (opts.reason !== undefined) hs.permissionDecisionReason = opts.reason;
        if (hasHookSpecificFields(hs)) out.hookSpecificOutput = hs;

        return emitJson(out);
    }
}
