import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminsidenavComponent } from '../adminsidenav/adminsidenav.component';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from './archive.service';

interface ArchiveItem {
  id: number;
  dateArchived: string;
  firstname: string;
  lastname: string;
  gender: string;
  email: string;
  contact_number: string;
  home_address: string;
  remarks: string;
}

@Component({
    selector: 'app-archive',
    imports: [
        CommonModule,
        RouterModule,
        AdminsidenavComponent,
        FormsModule
    ],
    templateUrl: './archive.component.html',
    styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {
  archiveItems: ArchiveItem[] = [];
  filteredItems: ArchiveItem[] = [];
  searchQuery: string = '';
  showDeleteModal: boolean = false;
  itemToDelete: ArchiveItem | null = null;
  showViewModal: boolean = false;  // For the view modal
  selectedItem: ArchiveItem | null = null; // For the selected item to view details

  constructor(private archiveService: ArchiveService) {
    this.archiveItems = this.archiveService.getArchivedUsers();
    this.filteredItems = [...this.archiveItems];
  }

  ngOnInit() {
    this.loadArchivedUsers();
  }

  loadArchivedUsers() {
    const archivedUsers: ArchiveItem[] = JSON.parse(localStorage.getItem('archivedUsers') || '[]');
    this.archiveItems = archivedUsers;
    this.filteredItems = [...this.archiveItems];
  }

  onSearch() {
    this.filteredItems = this.archiveItems.filter(item =>
      (item.firstname.toLowerCase() + ' ' + item.lastname.toLowerCase()).includes(this.searchQuery.toLowerCase())
    );
  }

  openDeleteModal(item: ArchiveItem) {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  confirmDelete() {
    if (this.itemToDelete) {
      this.archiveItems = this.archiveItems.filter(item => item.id !== this.itemToDelete?.id);
      this.filteredItems = this.filteredItems.filter(item => item.id !== this.itemToDelete?.id);
      localStorage.setItem('archivedUsers', JSON.stringify(this.archiveItems));
      this.closeDeleteModal();
    }
  }

  // Methods for the View User modal
  openViewModal(item: ArchiveItem) {
    this.selectedItem = item;  // Set the selected item
    this.showViewModal = true;  // Show the modal
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedItem = null;
  }
}
