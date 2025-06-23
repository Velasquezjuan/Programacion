import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot(),  
    AppRoutingModule,
    AppComponent          
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
