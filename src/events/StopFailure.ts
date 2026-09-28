/**
 * StopFailure — runs when a turn ends because of an API error instead of
 * Claude finishing normally.
 *
 * Observational: log the failure, notify someone, or show the user a hint.
 * Claude isn't running, so there's no context to inject and nothing to block.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export type StopFailureError =
    | 'authentication_failed'
    | 'oauth_org_not_allowed'
    | 'account_on_hold'
    | 'verification_required'
    | 'billing_error'
    | 'rate_limit'
    | 'overloaded'
    | 'invalid_request'
    | 'model_not_found'
    | 'server_error'
    | 'unknown'
    | 'max_output_tokens'
    | 'cloud_credential_error';

export interface StopFailureInput extends RawHookInput<'StopFailure'> {
    error: StopFailureError;
    error_details?: string;
    last_assistant_message?: string;
}

export type StopFailureEmitOptions = CommonEmitOptions;

type StopFailureJsonOutput = CommonJsonOutput;

export class StopFailure {
    static parse(): StopFailureInput {
        return readHookInput('StopFailure') as StopFailureInput;
    }

    static emitOutput(opts: StopFailureEmitOptions = {}): never {
        const out = mixinCommon<StopFailureJsonOutput>({}, opts);
        return emitJson(out);
    }
}
