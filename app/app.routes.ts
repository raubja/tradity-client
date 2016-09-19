import { provideRouter, RouterConfig } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { GameComponent } from './game.component';
import { ProfileComponent } from './profile.component';
import { PortfolioComponent } from './portfolio.component';
import { TransactionsComponent } from './transactions.component';
import { RankingComponent } from './ranking.component';

const routes: RouterConfig = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: GameComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'portfolio', component: PortfolioComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'ranking', component: RankingComponent }
    ]
  }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];