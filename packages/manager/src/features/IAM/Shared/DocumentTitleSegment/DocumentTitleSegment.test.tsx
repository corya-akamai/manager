import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DocumentTitleSegment } from './DocumentTitleSegment';

const Parent = () => {
  return (
    <>
      <DocumentTitleSegment segment="Identity and Access" />
      <DocumentTitleSegment segment="SSO Enforcement" />
    </>
  );
};

describe('IAM DocumentTitleSegment', () => {
  it('updates the document title independently for IAM routes', () => {
    renderWithTheme(<Parent />);

    expect(document.title).toEqual(
      'SSO Enforcement | Identity and Access | Akamai Cloud Manager'
    );
  });
});
