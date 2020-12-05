import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "./interfaces";
import {StorageService} from "./storage.service";
import jwt_decode from "jwt-decode"
import {Router} from "@angular/router";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  signInVerificationToken;
  timeout
  x

  constructor(private http: HttpClient, public storage: StorageService, private router: Router) {
    this.authenticate()
  }

  login(userName: string) {
    userName = userName.trim().toLowerCase()
    return this.http.post<{ verified: boolean, verificationCode: number, token: string }>(environment.host + '/login', {userName}).subscribe(next => {
      if (!next.verified)
        alert('Usuario no encontrado')

      if (next.token) {
        this.signInVerificationToken = next.token
        this.getTokenTimout(next.token)
      }
      if (next.verificationCode)
        setTimeout(() => {

          alert('El código de verificacion es  ' + next.verificationCode + ' Para propósito de prueba. (Este código deberá ser enviado a una API de SMS y al teléfono registrado del usuario) ')
        }, 100)

    })
  }


  verification(verificationCode: string) {
    return this.http.post<{ invalid?: boolean, verified?: boolean, token: string }>(environment.host + '/verification', {
      verificationCode,
      token: this.signInVerificationToken
    }).subscribe(next => {

      if (next.invalid) {
        alert('Codigo Erroneo')
        return
      }
      if (!next.verified)
        alert('El codigo ha caducado')

      if (next.token) {
        this.setToken(next.token)
        this.signInVerificationToken = null
        this.router.navigateByUrl('/').then()

      }
    })
  }

  resend() {
    if (this.signInVerificationToken)
      return this.http.post<{ verificationCode: number, verified?: boolean, token: string }>(environment.host + '/resendVerificationCode', {
        token: this.signInVerificationToken
      }).subscribe(next => {
        if (!next.verified)
          alert('El codigo ha caducado')

        if (next.token) {
          this.signInVerificationToken = next.token
          this.getTokenTimout(next.token)
        }
        if (next.verificationCode)
          alert(next.verificationCode)

      })
  }

  authenticate() {
    const token = this.getToken()
    if (token)
      this.http.post<User>(environment.host + '/authenticate', {token}).subscribe(next => {
        if (next.authenticated) {
          this.setToken(next.token)
        } else {
          this.revokeToken()
        }
      })
  }

  getToken() {
    return localStorage.getItem('token')
  }

  setToken(token) {
    console.log('new Token')
    this.storage.store('token', token)
  }

  revokeToken() {
    this.storage.clear('token')
    this.router.navigateByUrl('/login').then()
  }

  getUserInfo(token: string): User {
    if (token) {
      const decoded: { user: User } = jwt_decode(token)
      if (!decoded.user.photoUrl) decoded.user.photoUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTVl1FYFsRH7ezNbbP8_KL5GHIbud6s1VhRA&usqp=CAU'
      return decoded.user
    }
  }

  getPermScope() {
    return this.getUserInfo(this.getToken()).permScope
  }

  getTokenExpirationDate(token: string): Date {
    const decoded: any = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  isTokenExpired(token?: string): boolean {
    if (!token) return true;

    const date = this.getTokenExpirationDate(token);
    if (date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
  }

  getTokenTimout(token: string) {

    clearInterval(this.x)

    this.x = setInterval(() => {
      const distance = this.getTokenExpirationDate(token).getTime() - new Date().getTime()
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if (seconds <= 0) {
        clearInterval(this.x)
        this.signInVerificationToken = null
      }
      this.timeout = seconds
    }, 1000)
  }

}
