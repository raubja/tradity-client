import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { routing, appRoutingProviders } from './app.routing';
import { AppComponent } from './app.component';
import { GameModule } from './game/game.module';
import { PortfolioModule } from './portfolio/portfolio.module';

import { ApiService } from './api.service';
import { StocksService } from './stocks.service';
import { UserService } from './user.service';
import { RankingService } from './ranking.service';
import { LoginModule } from './login/login.module';
import { ProfileComponent } from './profile.component';
import { RankingComponent } from './ranking.component';

@NgModule({
    declarations: [
      AppComponent,
      ProfileComponent,
      RankingComponent
    ],
    imports: [
      BrowserModule,
      FormsModule,
      HttpModule,
      routing,
      LoginModule,
      PortfolioModule,
      GameModule
    ],
    providers: [
      appRoutingProviders,
      ApiService,
      StocksService,
      UserService,
      RankingService
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}