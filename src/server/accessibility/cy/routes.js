import { accessibilityController } from '~/src/server/accessibility/cy/controller';

const routes = [
  {
    method: 'GET',
    path: '/hygyrchedd/cy',
    ...accessibilityController
  }
];

export { routes };