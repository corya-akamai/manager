import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Grid from '@mui/material/Grid';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { Paper } from 'src/components/Paper';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import {
  StyledBox,
  StyledDateCalendar,
  StyledTimePicker,
  StyledTypography,
} from 'src/features/Databases/DatabaseDetail/DatabaseBackups/DatabaseBackups.style';
import { useOrder } from 'src/hooks/useOrder';
import {
  useDatabaseBackupsQuery,
  useDatabaseQuery,
} from 'src/queries/databases/databases';
import { formatDate } from 'src/utilities/formatDate';

import { BackupTableRow } from './DatabaseBackupTableRow';
import RestoreFromBackupDialog from './RestoreFromBackupDialog';

import type { DatabaseBackup, Engine } from '@linode/api-v4/lib/databases';
import type { Dayjs } from 'dayjs';

interface Props {
  disabled?: boolean;
}

export const DatabaseBackups = (props: Props) => {
  const { disabled } = props;
  const { databaseId, engine } = useParams<{
    databaseId: string;
    engine: Engine;
  }>();

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [idOfBackupToRestore, setIdOfBackupToRestore] = React.useState<
    number | undefined
  >();

  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);
  const [selectedBackup, setSelectedBackup] = React.useState<DatabaseBackup>();
  const [selectedTime, setSelectedTime] = React.useState<Dayjs | null>(
    dayjs().hour(1).minute(0).second(0).millisecond(0)
  );

  const id = Number(databaseId);

  const {
    data: database,
    error: databaseError,
    isLoading: isDatabaseLoading,
  } = useDatabaseQuery(engine, id);

  const {
    data: backups,
    error: backupsError,
    isLoading: isBackupsLoading,
  } = useDatabaseBackupsQuery(engine, id);

  const { handleOrderChange, order, orderBy } = useOrder({
    order: 'desc',
    orderBy: 'created',
  });

  const onRestore = (id: number) => {
    setIdOfBackupToRestore(id);
    setIsRestoreDialogOpen(true);
  };

  const backupToRestore = backups?.data.find(
    (backup) => backup.id === idOfBackupToRestore
  );

  const sorter = (a: DatabaseBackup, b: DatabaseBackup) => {
    if (order === 'asc') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    }
    return new Date(a.created).getTime() - new Date(b.created).getTime();
  };

  const renderTableBody = () => {
    if (databaseError) {
      return <TableRowError colSpan={3} message={databaseError[0].reason} />;
    }
    if (backupsError) {
      return <TableRowError colSpan={3} message={backupsError[0].reason} />;
    }
    if (isDatabaseLoading || isBackupsLoading) {
      return <TableRowLoading columns={3} />;
    }
    if (backups?.results === 0) {
      return <TableRowEmpty colSpan={3} message="No backups to display." />;
    }
    if (backups) {
      return backups.data
        .sort(sorter)
        .map((backup) => (
          <BackupTableRow
            backup={backup}
            disabled={disabled}
            key={backup.id}
            onRestore={onRestore}
          />
        ));
    }
    return null;
  };

  const isWithinLastTenDays = (date: Dayjs) => {
    const today = dayjs().startOf('day');
    const tenDaysAgo = today.subtract(9, 'day');

    return date.isBefore(tenDaysAgo, 'day') || date.isAfter(today, 'day');
  };

  const backupsCount = backups?.data.length;
  const newestBackup = backups?.data[0]
    ? formatDate(backups?.data[0].created, { timezone: 'utc' })
    : '';
  const oldestBackup = backupsCount
    ? formatDate(backups?.data[backupsCount - 1].created, { timezone: 'utc' })
    : '';
  // const isDisplayFlowA = database?.platform === 'adb10';
  const isDisplayFlowA = true;
  const onRestoreFlowA = (selectedDate: Dayjs | null) => {
    const d = selectedDate?.format('YYYY-MM-DD');
    const t = selectedTime?.format('HH:mm:ss.SSS');
    const selectedDateTime = `${d}T${t}Z`;

    const backup = backups?.data.find((backup) => {
      return backup.created === selectedDateTime;
    });
    setSelectedBackup(backup);
    setIsRestoreDialogOpen(true);
  };
  dayjs.extend(utc);
  return isDisplayFlowA ? (
    <Paper style={{ marginTop: 16 }}>
      <Typography variant="h2">Summary</Typography>
      <StyledTypography>
        Databases are automatically backed-up with full daily backups for the
        past 10 days, and binary logs recorded continuously. Full backups are
        version-specific binary backups, which when combined with binary
        logs allow for consistent recovery to a specific point in time (PITR).
      </StyledTypography>
      <Grid alignItems="stretch" container mt={2} spacing={1}>
        <Grid item md={4} xs={12}>
          <StyledBox>
            <Typography variant="h2">Number of Full Backups</Typography>
            <Typography component="span" variant="h1">
              {backups?.data.length}
            </Typography>
          </StyledBox>
        </Grid>
        <Grid item md={4} xs={12}>
          <StyledBox>
            <Typography variant="h2">Newest Backup</Typography>
            <Typography variant="subtitle2">{newestBackup} (UTC)</Typography>
          </StyledBox>
        </Grid>
        <Grid item md={4} xs={12}>
          <StyledBox>
            <Typography variant="h2">Oldest Backup</Typography>
            <Typography variant="subtitle2">{oldestBackup} (UTC)</Typography>
          </StyledBox>
        </Grid>
      </Grid>
      <Divider spacingBottom={25} spacingTop={25} />
      <Typography variant="h2">Restore a Backup</Typography>
      <StyledTypography>
        Select a date and time within the last 10 days you want to create a fork
        from.
      </StyledTypography>
      <Grid container justifyContent="flex-start" mt={2}>
        <Grid item lg={3} md={4} xs={12}>
          <Typography variant="h3">Date</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StyledDateCalendar
              onChange={(date) => setSelectedDate(date)}
              shouldDisableDate={(date) => isWithinLastTenDays(dayjs(date))}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item lg={3} md={4} xs={12}>
          <Typography variant="h3">Time(UTC)</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StyledTimePicker
              slotProps={{
                desktopPaper: {
                  sx: {
                    '.MuiPickersLayout-contentWrapper': {
                      display: 'flex',
                    },
                    marginLeft: '-17px',
                  },
                },
              }}
              ampm={false}
              disabled={!selectedDate}
              label=""
              onChange={(time) => setSelectedTime(time)}
              slots={{ openPickerIcon: KeyboardArrowDownIcon }}
              timeSteps={{ hours: 1, minutes: 1 }}
              // timezone="UTC"
              value={selectedTime}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="flex-end">
          <Button
            buttonType="primary"
            data-qa-settings-button="restore"
            disabled={selectedDate ? false : true}
            onClick={() => onRestoreFlowA(selectedDate)}
          >
            Restore
          </Button>
        </Box>
      </Grid>
      {database && selectedBackup ? (
        <RestoreFromBackupDialog
          backup={selectedBackup}
          database={database}
          onClose={() => setIsRestoreDialogOpen(false)}
          open={isRestoreDialogOpen}
        />
      ) : null}
    </Paper>
  ) : (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'created'}
              direction={order}
              handleClick={handleOrderChange}
              label="created"
              style={{ width: 155 }}
            >
              Date Created
            </TableSortCell>
            <TableCell></TableCell>
            <TableCell style={{ width: 100 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
      <Paper style={{ marginTop: 16 }}>
        <Typography variant="h3">Backup Schedule</Typography>
        <Typography style={{ lineHeight: '20px', marginTop: 4 }}>
          A backup of this database is created every 24 hours and each backup is
          retained for 7 days.
        </Typography>
      </Paper>
      {database && backupToRestore ? (
        <RestoreFromBackupDialog
          backup={backupToRestore}
          database={database}
          onClose={() => setIsRestoreDialogOpen(false)}
          open={isRestoreDialogOpen}
        />
      ) : null}
    </>
  );
};

export default DatabaseBackups;
