import { ElementError } from '../../errors/index.mjs';
import { GOVUKFrontendComponent } from '../../govuk-frontend-component.mjs';

/**
 * Header component
 *
 * @preserve
 */
class Header extends GOVUKFrontendComponent {
  /**
   * Apply a matchMedia for desktop which will trigger a state sync if the
   * browser viewport moves between states.
   *
   * @param {Element | null} $module - HTML element to use for header
   */
  constructor($module) {
    super();
    this.$module = void 0;
    this.$menuButton = void 0;
    this.$menu = void 0;
    this.menuIsOpen = false;
    this.mql = null;
    if (!$module) {
      throw new ElementError({
        componentName: 'Header',
        element: $module,
        identifier: 'Root element (`$module`)'
      });
    }
    this.$module = $module;
    const $menuButton = $module.querySelector('.govuk-js-header-toggle');
    if (!$menuButton) {
      return this;
    }
    const menuId = $menuButton.getAttribute('aria-controls');
    if (!menuId) {
      throw new ElementError({
        componentName: 'Header',
        identifier: 'Navigation button (`<button class="govuk-js-header-toggle">`) attribute (`aria-controls`)'
      });
    }
    const $menu = document.getElementById(menuId);
    if (!$menu) {
      throw new ElementError({
        componentName: 'Header',
        element: $menu,
        identifier: `Navigation (\`<ul id="${menuId}">\`)`
      });
    }
    this.$menu = $menu;
    this.$menuButton = $menuButton;
    this.mql = window.matchMedia('(min-width: 48.0625em)');
    if ('addEventListener' in this.mql) {
      this.mql.addEventListener('change', () => this.syncState());
    } else {
      this.mql.addListener(() => this.syncState());
    }
    this.syncState();
    this.$menuButton.addEventListener('click', () => this.handleMenuButtonClick());
  }
  syncState() {
    if (!this.mql || !this.$menu || !this.$menuButton) {
      return;
    }
    if (this.mql.matches) {
      this.$menu.removeAttribute('hidden');
      this.$menuButton.setAttribute('hidden', '');
    } else {
      this.$menuButton.removeAttribute('hidden');
      this.$menuButton.setAttribute('aria-expanded', this.menuIsOpen.toString());
      if (this.menuIsOpen) {
        this.$menu.removeAttribute('hidden');
      } else {
        this.$menu.setAttribute('hidden', '');
      }
    }
  }
  handleMenuButtonClick() {
    this.menuIsOpen = !this.menuIsOpen;
    this.syncState();
  }
}
Header.moduleName = 'govuk-header';

export { Header };
//# sourceMappingURL=header.mjs.map
