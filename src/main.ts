import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';  // ✅ Import this
import { routes } from './app/app.routes';

const placeholderRoute = 'login'; // Change this to the component you want to serve ('register' or 'login')

const updatedRoutes = routes.map((route) => {
  if (route.redirectTo === 'placeholder') {
    return { ...route, redirectTo: placeholderRoute };
  }
  return route;
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(updatedRoutes),
    provideHttpClient()  // ✅ Add this to globally provide HttpClient
  ],
}).catch((err) => console.error(err));
