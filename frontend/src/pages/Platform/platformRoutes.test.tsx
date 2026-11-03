import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useRoutes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { platformRoutes } from './platformRoutes';

vi.mock('./CompaniesPage', () => ({ default: () => <h1>Company workspace</h1> }));

function RoutesUnderTest() {
  const routes = useRoutes(platformRoutes);
  const location = useLocation();
  return <>{routes}<output aria-label="Current route">{location.pathname}{location.search}</output></>;
}

it.each(['/platform/inquiries', '/platform/service', '/platform/audit?companyId=42'])(
  'temporarily hidden page %s redirects to Companies, including old bookmarks', async path => {
    render(<MemoryRouter initialEntries={[path]}><RoutesUnderTest /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Company workspace' })).toBeInTheDocument();
    expect(screen.getByLabelText('Current route')).toHaveTextContent(/^\/platform\/companies$/);
  },
);
