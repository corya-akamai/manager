import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Box } from './Box';

describe('Box', () => {
  it('renders children', () => {
    renderWithTheme(
      <Box>
        <span>first</span>
        <span>second</span>
      </Box>
    );

    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });

  it('applies flex-direction: column by default', () => {
    const { container } = renderWithTheme(
      <Box>
        <span>child</span>
      </Box>
    );

    expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
  });

  it('applies the given direction', () => {
    const { container } = renderWithTheme(
      <Box direction="row">
        <span>child</span>
      </Box>
    );

    expect(container.firstChild).toHaveStyle({ flexDirection: 'row' });
  });

  describe('responsive direction (xs breakpoint)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 0,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
      });
    });

    it('applies the first breakpoint value when direction is an array', () => {
      const { container } = renderWithTheme(
        <Box direction={['column', 'row']}>
          <span>child</span>
        </Box>
      );

      expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
    });

    it('applies the xs value when direction is an object', () => {
      const { container } = renderWithTheme(
        <Box direction={{ xs: 'column-reverse', sm: 'row' }}>
          <span>child</span>
        </Box>
      );

      expect(container.firstChild).toHaveStyle({
        flexDirection: 'column-reverse',
      });
    });
  });

  it('applies gap for row direction spacing when wrapping (default)', () => {
    const { container } = renderWithTheme(
      <Box direction="row" spacing={2}>
        <span>a</span>
        <span>b</span>
      </Box>
    );

    // wrap defaults to 'wrap', so gap is used on both axes → 2 * 8px = 16px
    expect(container.firstChild).toHaveStyle({ gap: '16px' });
  });

  it('applies only column-gap for row direction when wrap is nowrap', () => {
    const { container } = renderWithTheme(
      <Box direction="row" spacing={2} wrap="nowrap">
        <span>a</span>
        <span>b</span>
      </Box>
    );

    expect(container.firstChild).toHaveStyle({ columnGap: '16px' });
  });

  it('applies gap for column direction spacing', () => {
    const { container } = renderWithTheme(
      <Box spacing={1}>
        <span>a</span>
        <span>b</span>
      </Box>
    );

    // spacing={1} → 8px
    expect(container.firstChild).toHaveStyle({ gap: '8px' });
  });

  it('applies gap for row direction with a string spacing value when wrapping', () => {
    const { container } = renderWithTheme(
      <Box direction="row" spacing="1rem">
        <span>a</span>
        <span>b</span>
      </Box>
    );

    expect(container.firstChild).toHaveStyle({ gap: '1rem' });
  });

  it('renders as a custom component', () => {
    const { container } = renderWithTheme(
      <Box component="section">
        <span>child</span>
      </Box>
    );

    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('applies sx styles', () => {
    renderWithTheme(
      <Box
        direction="column"
        style={{ justifyContent: 'space-between', paddingBottom: '20px' }}
      >
        <span>child</span>
      </Box>
    );

    // Find the Box via its child — container.firstChild may be a router wrapper
    const box = screen.getByText('child').parentElement;
    expect(box).toHaveStyle({
      justifyContent: 'space-between',
      paddingBottom: '20px',
    });
  });

  it('does not apply gap when spacing is 0', () => {
    const { container } = renderWithTheme(
      <Box spacing={0}>
        <span>a</span>
      </Box>
    );

    expect(container.firstChild).not.toHaveStyle({ gap: expect.anything() });
  });
});
