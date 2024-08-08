import { screen } from '@testing-library/react';
import * as React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseSettings from './DatabaseSettings';
describe('DatabaseSettings Component', () => {
  const database = databaseFactory.build();
  it('Should exist and be renderable', () => {
    expect(DatabaseSettings).toBeDefined();
    renderWithTheme(<DatabaseSettings database={database} />);
  });

  it('Should render a Paper component with headers for Access Controls, Reseting the Root password, and Deleting the Cluster', () => {
    const { container, getAllByRole } = renderWithTheme(
      <DatabaseSettings database={database} />
    );
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).not.toBeNull();
    const headings = getAllByRole('heading');
    expect(headings[0].textContent).toBe('Access Controls');
    expect(headings[1].textContent).toBe('Reset Root Password');
    expect(headings[2].textContent).toBe('Delete Cluster');
  });

  it('Should render Maintenance Window with radio buttons', () => {
    const database = databaseFactory.build({
      platform: 'adb10',
    });
    const { getByRole } = renderWithTheme(
      <DatabaseSettings database={database} />
    );
    const radioInput = getByRole('radiogroup');
    expect(radioInput).toHaveTextContent('Monthly');
    expect(radioInput).toHaveTextContent('Weekly');
    expect(screen.queryByText('Maintenance Window')).toBeTruthy();
  });

  it('Should render Weekly Maintenance Window', () => {
    const database = databaseFactory.build({
      platform: 'adb20',
    });
    renderWithTheme(<DatabaseSettings database={database} />);

    expect(screen.queryByText('Monthly')).toBeNull();
    expect(screen.queryByText('Weekly')).toBeNull();
    expect(screen.queryByText('Set a Weekly Maintenance Window')).toBeTruthy();
  });
});
