import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service'; // ✅ import your service

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  isCollapsed = true;
  isMockupOpen = false;

  mockupData = {
    name: '',
    email: '',
    phone: '',
    date: '',
    requirements: ''
  };

  constructor(private appointmentService: AppointmentService) {} // ✅ Inject the service

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  toggleMockupForm() {
    this.isMockupOpen = !this.isMockupOpen;
    if (this.isMockupOpen) {
      this.isCollapsed = true;
    }
  }

  submitMockupForm(event: Event) {
    event.preventDefault();

    this.appointmentService.submitForm(this.mockupData).subscribe({
      next: () => {
        alert('Booking submitted successfully!');
        this.toggleMockupForm();
      },
      error: (error) => {
        if (error.status === 400) {
          alert('This email already exists! Please use a different email.');
        } else {
          alert('Failed to submit booking. Please try again.');
        }
      }
    });
  }
}
