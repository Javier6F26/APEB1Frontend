import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from "rxjs";
import {share} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class StorageService implements OnDestroy {

  private onSubject = new Subject<{ key: string, value: string }>()
  public changes = this.onSubject.asObservable().pipe(share())

  constructor() {
  }

  ngOnDestroy(): void {
    this.stop()
  }

  public start() {
    window.addEventListener("storage", this.storageEventListener.bind(this))
    const token = localStorage.getItem('token')
    this.onSubject.next({key: 'token', value: token})
  }

  private stop() {
    window.removeEventListener('storage', this.storageEventListener.bind(this))
    this.onSubject.complete()
  }

  private storageEventListener(event: StorageEvent) {
    if (event.storageArea == localStorage) {
      this.onSubject.next({key: event.key, value: event.newValue})

    }
  }

  public store(key: string, data: any): void {
    localStorage.setItem(key, data);
    this.onSubject.next({key: key, value: data})
  }

  public clear(key) {
    localStorage.removeItem(key);
    this.onSubject.next({key: key, value: null});
  }

}
