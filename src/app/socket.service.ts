import {Injectable} from '@angular/core';
import {StorageService} from "./storage.service";
import {Socket} from "ngx-socket-io";
import {observable, Observable, of} from "rxjs";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  IO: Socket

  constructor(private storage: StorageService, private router: Router, private auth: AuthService) {
    this.connect()
    storage.changes.subscribe((next) => {
      if (!next.value) {
        this.IO.disconnect()
        router.navigateByUrl('/login')
      }
    })
    storage.start()
  }

  connect() {
    this.IO = new Socket({url: 'http://localhost:45001', options: {query: {token: this.auth.getToken()}}})
    this.IO.on('connect', () => {
      console.log('Conectado al Servidor')
    });
    this.IO.on('disconnect', () => {
      console.log('Desconectado del Servidor')
    })
    this.IO.on('error', () => {
      console.log('Error de Autenticacion')
      this.storage.clear('token')
      this.router.navigateByUrl('/login').then()
    })
  }
}

