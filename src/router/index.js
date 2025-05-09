import { createRouter, createWebHistory } from "vue-router";
import AccessContentComponent from "../iam/components/access-view/access-content.component.vue";
import RegisterView from "../iam/components/register-view/register-view.component.vue"; // Importa tu componente de registro
import AuthService from "../iam/service/auth_service.js";
import ControlPanelPageComponent from "../public/pages/control-panel-page.component.vue";
import SuppliesContentComponent from "../supply/components/supplies-content.component.vue";
import ProfilePage from "../profiles/views/ProfilePage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AccessContentComponent,
            meta: {
                guestOnly: true,
                defaultTab: 'login'
            }
        },
        {
            path: '/register',
            component: AccessContentComponent,
            meta: {
                guestOnly: true,
                defaultTab: 'register'
            }
        },
        {
            path: '/panel',
            component: ControlPanelPageComponent,
            meta: { requiresAuth: true },
            name: 'panel'
        },
        {
            path: '/supply',
            component: SuppliesContentComponent,
            meta: {
                requiresAuth: true,
                requiredRoles: [1, 2] // 1: Owner, 2: Admin
            },
            name: 'supply'
        },
        {
            path: '/profile',
            name: 'Profile',
            component: ProfilePage,
            meta: {
                requiresAuth: true
            }
        },

        // Ruta para manejar accesos no autorizados

    ]
});

router.beforeEach(async (to, from, next) => {
    // Redirigir usuarios autenticados que intentan acceder a páginas de invitado
    if (to.meta.guestOnly && AuthService.isAuthenticated()) {
        next('/panel');
        return;
    }

    // Verificar autenticación para rutas protegidas
    if (to.meta.requiresAuth) {
        if (!AuthService.isAuthenticated()) {
            next({ path: '/', query: { redirect: to.fullPath } });
            return;
        }

        // Verificar roles si es necesario
        if (to.meta.requiredRoles) {
            const userRole = AuthService.getCurrentUserRole();
            if (!to.meta.requiredRoles.includes(parseInt(userRole))) {
                next('/unauthorized');
                return;
            }
        }
    }

    next();
});

export default router;