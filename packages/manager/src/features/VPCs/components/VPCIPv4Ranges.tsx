import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';

import type { VPCIPv4Range } from '@linode/api-v4';

interface Props {
  /**
   * Disables the inputs.
   */
  disabled?: boolean;

  /**
   * Field-level error message shown above the inputs.
   */
  error?: string;

  /**
   * Called when a range input loses focus (useful for triggering validation).
   */
  onBlur?: () => void;

  /**
   * Called with the updated list of ranges whenever an input changes.
   */
  onChange: (ranges: VPCIPv4Range[]) => void;

  /**
   * Per-range error messages, aligned by index with `ranges`.
   */
  rangeErrors?: (string | undefined)[];

  /**
   * The current list of custom VPC IPv4 ranges (CIDRs).
   */
  ranges: VPCIPv4Range[];
}

/**
 * Renders a variable number of custom IPv4 Range (CIDR) inputs for a VPC.
 *
 * The user can specify one or more CIDRs that apply to the whole VPC.
 *
 * Shared between the VPC Create flow and the Edit VPC drawer (which prefills
 * `ranges` from the API response).
 */
export const VPCIPv4Ranges = (props: Props) => {
  const { disabled, error, onBlur, onChange, rangeErrors, ranges } = props;

  // Always show at least one input so the user has an empty field to fill in.
  const displayRanges: VPCIPv4Range[] =
    ranges.length > 0 ? ranges : [{ range: '' }];

  return (
    <MultipleIPInput
      buttonText="Add IPv4 Range"
      disabled={disabled}
      error={error}
      forVPCIPRanges
      ips={displayRanges.map((ipv4, index) => ({
        address: ipv4.range ?? '',
        error: rangeErrors?.[index],
      }))}
      onBlur={(ips) => {
        onChange(ips.map((ip) => ({ range: ip.address })));
        onBlur?.();
      }}
      onChange={(ips) => onChange(ips.map((ip) => ({ range: ip.address })))}
      placeholder="Enter IPv4 Range"
      title="VPC IPv4 Range"
      tooltip={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: Spacing.S16,
          }}
        >
          <p style={{ margin: 0 }}>
            The custom IPv4 address space for this VPC.
          </p>
          <p style={{ margin: 0 }}>
            These private ranges define available subnet boundaries and are not
            advertised to the public internet.
          </p>
          <p style={{ margin: 0 }}>
            Most IPv4 ranges are available except for certain restricted ranges.
          </p>
        </div>
      }
    />
  );
};
