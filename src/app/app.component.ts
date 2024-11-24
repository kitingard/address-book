import { Component, inject } from '@angular/core';
import { ContactFields } from './constants/contact-fields';
import { ModalComponent } from './components/modal/modal.component';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Contact } from './models/contact';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { LocalStorageService } from './services/local-storage/local-storage.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, ModalComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private fb = inject(FormBuilder);
  private localStorageService = inject(LocalStorageService);

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: [''],
  });
  isModalOpen = false;

  contactFields: ContactFields[] = Object.values(ContactFields);
  ContactFields = ContactFields;
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  private searchSubject = new BehaviorSubject<string>('');
  private sortSubject = new BehaviorSubject<
    ContactFields.FirstName | ContactFields.LastName
  >('' as ContactFields.FirstName);

  contactsData$: Observable<Contact[]> = combineLatest([
    this.contactsSubject.asObservable(),
    this.searchSubject.asObservable(),
    this.sortSubject.asObservable(),
  ]).pipe(
    map(([contacts, search, sort]) => {
      let filteredContacts = contacts;
      if (search) {
        const searchValue = search.toLowerCase();
        filteredContacts = filteredContacts.filter(
          (contact) =>
            contact.firstName.toLowerCase().includes(searchValue) ||
            contact.lastName.toLowerCase().includes(searchValue)
        );
      }

      if (sort) {
        filteredContacts = [...filteredContacts].sort((a, b) =>
          a[sort].localeCompare(b[sort])
        );
      }

      return filteredContacts;
    })
  );

  search$: Observable<string> = this.searchSubject.asObservable();

  ngOnInit(): void {
    this.loadContactsFromStorage();
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  addContact(): void {
    const newContact: Contact = { ...this.form.getRawValue(), id: uuidv4() };
    const updatedContacts = [newContact, ...this.contactsSubject.value];
    this.updateContacts(updatedContacts);

    this.form.reset();
    this.toggleModal();
  }

  deleteContact(id: string): void {
    const updatedContacts = this.contactsSubject
      .getValue()
      .filter((contact) => contact.id !== id);

    this.updateContacts(updatedContacts);
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchSubject.next(inputElement.value);
  }

  onSort(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortSubject.next(
      selectElement.value as ContactFields.FirstName | ContactFields.LastName
    );
  }

  private loadContactsFromStorage(): void {
    const storedContacts = this.localStorageService.getContacts() || [];
    this.contactsSubject.next(storedContacts);
  }

  private updateContacts(contacts: Contact[]): void {
    this.contactsSubject.next(contacts);
    this.localStorageService.setContacts(contacts);
  }
}
