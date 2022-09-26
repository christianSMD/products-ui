import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinisidenavComponent } from './minisidenav.component';

describe('MinisidenavComponent', () => {
  let component: MinisidenavComponent;
  let fixture: ComponentFixture<MinisidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinisidenavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MinisidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
