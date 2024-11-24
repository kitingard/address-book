import { Injectable } from '@angular/core';
import { Contact } from '../../models/contact';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly localStorageKey = 'contactsData';

  setContacts(contacts: Contact[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(contacts));
  }

  getContacts(): Contact[] {
    const storedContacts = localStorage.getItem(this.localStorageKey);
    return storedContacts ? JSON.parse(storedContacts) : [];
  }
}
