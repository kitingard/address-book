import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { Contact } from '../../models/contact';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  const mockContacts: Contact[] = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Jordan',
      phoneNumber: '544-1234',
    },
    {
      id: '2',
      firstName: 'Rudolf',
      lastName: 'Deer',
      phoneNumber: '655-5678',
    },
  ];
  const localStorageKey = 'contactsData';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);

    spyOn(localStorage, 'setItem').and.stub();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save contacts to localStorage', () => {
    service.setContacts(mockContacts);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      localStorageKey,
      JSON.stringify(mockContacts)
    );
  });

  it('should retrieve contacts from localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify(mockContacts)
    );
    const contacts = service.getContacts();

    expect(localStorage.getItem).toHaveBeenCalledWith(localStorageKey);
    expect(contacts).toEqual(mockContacts);
  });

  it('should return an empty array if localStorage is empty', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    const contacts = service.getContacts();

    expect(localStorage.getItem).toHaveBeenCalledWith(localStorageKey);
    expect(contacts).toEqual([]);
  });
});
