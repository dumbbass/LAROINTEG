import { TestBed } from '@angular/core/testing';

import { AppointmentListService } from './appointment-list.service';

describe('AppointmentListService', () => {
  let service: AppointmentListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
