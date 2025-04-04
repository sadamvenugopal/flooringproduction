import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent {
  images = [
    { id: 'T0001', src: '/image1.png', alt: 'Project 1' },
    { id: 'T0002', src: '/image2.png', alt: 'Project 2' },
    { id: 'T0001', src: '/image3.png', alt: 'Project 3' },
    { id: 'T0001', src: '/image4.png', alt: 'Project 4' },
    { id: 'T0001', src: '/image5.png', alt: 'Project 5' },
    { id: 'T0001', src: '/image6.png', alt: 'Project 6' },
    { id: 'T0001', src: '/image7.png', alt: 'Project 7' },

  ];
  

  isLightboxOpen = false;
  currentImageIndex = 0;
  lastTap = 0;
  isZoomed = false;

  openLightbox(index: number) {
    this.currentImageIndex = index;
    this.isLightboxOpen = true;
    this.isZoomed = false; // Reset zoom on opening

  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.isZoomed = false;

  }

  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

   // Handle keyboard navigation (Arrow keys for next/prev, Escape to close)
   @HostListener('window:keydown', ['$event'])
   handleKeydown(event: KeyboardEvent) {
     if (this.isLightboxOpen) {
       if (event.key === 'ArrowRight') this.nextImage();
       if (event.key === 'ArrowLeft') this.prevImage();
       if (event.key === 'Escape') this.closeLightbox();
     }
   }

   toggleZoom() {
    this.isZoomed = !this.isZoomed;
  }

     // Double-tap to zoom
     handleDoubleTap(event: TouchEvent) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - this.lastTap;
    
      if (tapLength < 300 && tapLength > 0) {
        this.toggleZoom();
      }
    
      this.lastTap = currentTime;
    }
}
