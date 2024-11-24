import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Output() clickOnCloseButton = new EventEmitter();

  closeModal() {
    this.clickOnCloseButton.emit();
  }
}
