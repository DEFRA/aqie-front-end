import { routes } from './routes';
import { accessibilityController } from '~/src/server/accessibility/controller';

jest.mock('~/src/server/accessibility/controller');

describe('Accessibility Routes', () => {
  it('should define the accessibility route', () => {
    expect(routes).toEqual([
      {
        method: 'GET',
        path: '/accessibility',
        ...accessibilityController
      }
    ]);
  });
});