import { Factory } from '@linode/utilities';

import type { LongviewProcesses, ProcessStats } from '@linode/api-v4/longview';

const mockStats = [
  { x: 0, y: 1 },
  { x: 0, y: 2 },
  { x: 0, y: 3 },
];

const mockProcess = Factory.Sync.makeFactory<ProcessStats>({
  count: mockStats,
  cpu: mockStats,
  ioreadkbytes: mockStats,
  iowritekbytes: mockStats,
  mem: mockStats,
});

export const longviewProcessFactory =
  Factory.Sync.makeFactory<LongviewProcesses>({
    Processes: {
      bash: {
        longname: '/usr/sbin/cron',
        root: mockProcess.build(),
      } as any,
      sshd: {
        longname: '/usr/sbin/cron',
        root: mockProcess.build(),
      } as any,
      systemd: {
        longname: '/usr/sbin/cron',
        root: mockProcess.build(),
      } as any,
    },
  });
