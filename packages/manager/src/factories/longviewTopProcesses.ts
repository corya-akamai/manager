import { Factory } from '@linode/utilities';

import type { LongviewTopProcesses, TopProcess } from '@linode/api-v4/longview';

export const topProcessFactory = Factory.Sync.makeFactory<TopProcess>({
  root: {
    count: 1,
    cpu: 5,
    entries: 2,
    mem: 1024 * 2,
  },
});

export const longviewTopProcessesFactory =
  Factory.Sync.makeFactory<LongviewTopProcesses>({
    Processes: {
      bash: topProcessFactory.build(),
      sshd: topProcessFactory.build(),
      systemd: topProcessFactory.build(),
    },
  });
