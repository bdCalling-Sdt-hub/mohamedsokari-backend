import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { AuthRouter } from '../app/modules/auth/auth.route';
import { ProductRouter } from '../app/modules/products/products.route';
import { CartRoute } from '../app/modules/cart/cart.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { TutorialRouter } from '../app/modules/admin/tutorial/tutorial.router';
import { BannerRoutes } from '../app/modules/banner/banner.routes';
import { ReportRoutes } from '../app/modules/report/report.routes';
import { AccauntRouter } from '../app/modules/acccaunt/accaunt.router';
import { OrderRouter } from '../app/modules/order/order.route';
import { NotificationRoutes } from '../app/modules/notification/notification.routes';
import { DashboardUserRouter } from '../app/modules/dashboard/userManagment/userManagment.router';
import { DashboardProductRouter } from '../app/modules/dashboard/productManagment/product.route';
import { AdminRoutes } from '../app/modules/admin/admin.route';
import { DashboardRouter } from '../app/modules/dashboard/dashboard.router';
import { ReviewRoutes } from '../app/modules/review/review.router';
import { CustomerReviewRoutes } from '../app/modules/customerreview/customerreview.routes';
import { FavouritdRouter } from '../app/modules/favourit/favourit.router';
import { ChatRoutes } from '../app/modules/chat/chat.routes';
import { MessageRoutes } from '../app/modules/message/message.routes';

const router = express.Router();
const routes = [
  {
    path: '/auth',
    route: AuthRouter,
  },
  {
    path: '/users',
    route: UserRouter,
  },
  {
    path: '/products',
    route: ProductRouter,
  },
  {
    path: '/cart',
    route: CartRoute,
  },
  {
    path: '/messages',
    route: MessageRoutes,
  },
  {
    path: '/chat',
    route: ChatRoutes,
  },
  {
    path: '/admin/category',
    route: CategoryRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/admin/tutorials',
    route: TutorialRouter,
  },
  {
    path: '/tutorials',
    route: TutorialRouter,
  },
  {
    path: '/admin/banner',
    route: BannerRoutes,
  },
  {
    path: '/banner',
    route: BannerRoutes,
  },
  {
    path: '/admin/feedback',
    route: ReviewRoutes,
  },
  {
    path: '/feedback',
    route: ReviewRoutes,
  },
  {
    path: '/reports',
    route: ReportRoutes,
  },
  {
    path: '/admin/reports',
    route: ReportRoutes,
  },
  {
    path: '/admin/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/accaunts',
    route: AccauntRouter,
  },
  {
    path: '/orders',
    route: OrderRouter,
  },
  {
    path: '/admin/users-managments',
    route: DashboardUserRouter,
  },
  {
    path: '/admin/product-managments',
    route: DashboardProductRouter,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/admin/dashboard',
    route: DashboardRouter,
  },
  {
    path: '/likes',
    route: FavouritdRouter,
  },
  {
    path: '/reviews',
    route: CustomerReviewRoutes,
  },
];

routes.forEach((element) => {
  if (element?.path && element?.route) {
    router.use(element?.path, element?.route);
  }
});

export default router;
