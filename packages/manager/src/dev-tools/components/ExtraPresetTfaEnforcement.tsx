import * as React from 'react';

import { extraMockPresets } from 'src/mocks/presets';
import {
  getTfaEnforcementData,
  setTfaEnforcementData,
} from 'src/mocks/presets/extra/account/tfaEnforcement';

import { saveTfaEnforcementData } from '../utils';

import type { TfaEnforcementMockData } from 'src/mocks/presets/extra/account/tfaEnforcement';

const tfaEnforcementPreset = extraMockPresets.find(
  (preset) => preset.id === 'account:tfa-enforcement'
);

interface ExtraPresetTfaEnforcementProps {
  handlers: string[];
  onFormChange?: (data: null | TfaEnforcementMockData | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
  tfaEnforcementData?: null | TfaEnforcementMockData;
}

export const ExtraPresetTfaEnforcement = ({
  handlers,
  onFormChange,
  onTogglePreset,
  tfaEnforcementData,
}: ExtraPresetTfaEnforcementProps) => {
  const isEnabled = handlers.includes('account:tfa-enforcement');
  const [tfaEnforced, setTfaEnforced] = React.useState(
    () => tfaEnforcementData?.tfaEnforced ?? true
  );

  const handleTogglePreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      saveTfaEnforcementData(null);
      setTfaEnforcementData(null);
    } else {
      const data = {
        tfaEnforced,
        tfaOptionalUsers: tfaEnforcementData?.tfaOptionalUsers ?? [],
      };
      saveTfaEnforcementData(data);
      setTfaEnforcementData(data);
      onFormChange?.(data);
    }

    onTogglePreset(e, 'account:tfa-enforcement');
  };

  const handleTfaEnforcedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTfaEnforced = e.target.checked;
    setTfaEnforced(nextTfaEnforced);

    if (!isEnabled) {
      return;
    }

    const data = {
      tfaEnforced: nextTfaEnforced,
      tfaOptionalUsers: getTfaEnforcementData()?.tfaOptionalUsers ?? [],
    };

    saveTfaEnforcementData(data);
    setTfaEnforcementData(data);
    onFormChange?.(data);
  };

  React.useEffect(() => {
    if (!isEnabled) {
      setTfaEnforcementData(null);
      setTfaEnforced(true);
      return;
    }

    const data = tfaEnforcementData ?? {
      tfaEnforced: true,
      tfaOptionalUsers: [],
    };

    setTfaEnforced(data.tfaEnforced);
    setTfaEnforcementData(data);
  }, [isEnabled, tfaEnforcementData]);

  if (!tfaEnforcementPreset) {
    return null;
  }

  return (
    <li className="dev-tools__list-box__separator">
      <label title={tfaEnforcementPreset.desc || tfaEnforcementPreset.label}>
        <input
          checked={isEnabled}
          onChange={handleTogglePreset}
          type="checkbox"
        />
        {tfaEnforcementPreset.label}
      </label>
      {isEnabled && (
        <label style={{ display: 'block', marginTop: 8 }}>
          <input
            checked={tfaEnforced}
            onChange={handleTfaEnforcedChange}
            type="checkbox"
          />
          Enforce 2FA for all users
        </label>
      )}
    </li>
  );
};
