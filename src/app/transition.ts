/**
 * @description Helper to configure each navigation animation direction
 * Use `@HostBinding(TRANSITION_HORIZONTAL)` on individual components or pages to enforce horizontal navigation transitions.
 * IMPORTANT: @HostBinding(TRANSITION_HORIZONTAL) seens only to work reliably, when the modules has been lazyloaded at least once.
 * Otherwise it can happen, that the first transition of a component on a page is still vertical only once when first entering, but horizontal when leaving
 *
 * Use <ion-router-outlet ${ROUTER_TRANSITION_HORIZONTAL}> or <ion-router-outlet data-transition-horizontal>
 * to enfore that all transitions are horizontal on this router-outlet
 */

// Se utiliza para 
import { iosTransitionAnimation, Animation, mdTransitionAnimation } from "@ionic/core";

export const TRANSITION_HORIZONTAL = "attr.data-transition-horizontal";
export const ROUTER_TRANSITION_HORIZONTAL = "data-transition-horizontal";

export function customTransition(navEl, opts): Animation {
    const enteringDirection = opts.enteringEl.getAttribute(
        "data-transition-horizontal"
    );
    const leavingDirection = opts.leavingEl.getAttribute(
        "data-transition-horizontal"
    );
    const routerOutletDirection = navEl.getAttribute(
        "data-transition-horizontal"
    );
    if (
        enteringDirection !== null ||
        leavingDirection !== null ||
        routerOutletDirection !== null
    ) {
        return iosTransitionAnimation(navEl, opts);
    }
    return mdTransitionAnimation(navEl, opts);
}
