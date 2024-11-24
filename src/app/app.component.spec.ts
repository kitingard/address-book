import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { LocalStorageService } from './services/local-storage/local-storage.service';
import { Contact } from './models/contact';
import { By } from '@angular/platform-browser';

class MockLocalStorageService {
  private contacts: Contact[] = [];

  getContacts() {
    return this.contacts;
  }

  setContacts(contacts: Contact[]) {
    this.contacts = contacts;
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let localStorageService: MockLocalStorageService;

  beforeEach(async () => {
    localStorageService = new MockLocalStorageService();

    await TestBed.configureTestingModule({
      imports: [AppComponent, ReactiveFormsModule],
      providers: [
        { provide: LocalStorageService, useValue: localStorageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize contacts from LocalStorageService', () => {
    const contacts = [
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Jordan',
        phoneNumber: '544-1234',
      },
    ];
    localStorageService.setContacts(contacts);

    component.ngOnInit();

    component.contactsData$.subscribe((data) => {
      expect(data).toEqual(contacts);
    });
  });

  it('should toggle the modal state', () => {
    expect(component.isModalOpen).toBeFalse();
    component.toggleModal();
    expect(component.isModalOpen).toBeTrue();
  });

  it('should add a contact and update observable', () => {
    const newContact = {
      firstName: 'Alice',
      lastName: 'Jordan',
      phoneNumber: '544-1234',
    };

    component.form.setValue(newContact);
    component.addContact();

    component.contactsData$.subscribe((contacts) => {
      expect(contacts.length).toBe(1);
    });
  });

  it('should delete a contact and update observable', () => {
    const contact = {
      id: '1',
      firstName: 'Alice',
      lastName: 'Jordan',
      phoneNumber: '544-1234',
    };

    localStorageService.setContacts([contact]);
    component.ngOnInit();

    component.deleteContact('1');

    component.contactsData$.subscribe((contacts) => {
      expect(contacts.length).toBe(0);
    });
  });

  it('should filter contacts based on search term', () => {
    const contacts = [
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

    localStorageService.setContacts(contacts);
    component.ngOnInit();

    const inputEvent = { target: { value: 'Alice' } } as any;
    component.onSearch(inputEvent);

    component.contactsData$.subscribe((filteredContacts) => {
      expect(filteredContacts.length).toBe(1);
      expect(filteredContacts[0].firstName).toBe('Alice');
    });
  });

  it('should sort contacts by first name', () => {
    const contacts = [
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

    localStorageService.setContacts(contacts);
    component.ngOnInit();

    const sortEvent = { target: { value: 'firstName' } } as any;
    component.onSort(sortEvent);

    component.contactsData$.subscribe((sortedContacts) => {
      expect(sortedContacts[0].firstName).toBe('Alice');
      expect(sortedContacts[1].firstName).toBe('Rudolf');
    });
  });

  it('should display a message when no contacts are found', () => {
    const inputEvent = { target: { value: 'invalid' } } as any;
    component.onSearch(inputEvent);

    fixture.detectChanges();

    const emptyStateMessage = fixture.debugElement.query(
      By.css('.empty-state')
    );
    expect(emptyStateMessage).toBeTruthy();
    expect(emptyStateMessage.nativeElement.textContent).toContain(
      'No matching entries found.'
    );
  });

  it('should reset the search when no term is provided', () => {
    component.onSearch({ target: { value: '' } } as any);

    component.contactsData$.subscribe((contacts) => {
      expect(contacts).toEqual(localStorageService.getContacts());
    });
  });
});
