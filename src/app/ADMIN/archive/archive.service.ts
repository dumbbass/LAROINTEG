import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  private archivedUsers: any[] = [];

  addArchivedUser(user: any) {
    this.archivedUsers.push(user);
  }

  getArchivedUsers() {
    return this.archivedUsers;
  }
} 