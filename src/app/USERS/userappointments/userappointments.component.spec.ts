import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserappointmentsComponent } from './userappointments.component';

describe('UserappointmentsComponent', () => {
  let component: UserappointmentsComponent;
  let fixture: ComponentFixture<UserappointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserappointmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserappointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
