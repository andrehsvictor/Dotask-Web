import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskIllustrationComponent } from './task-illustration.component';

describe('TaskIllustrationComponent', () => {
  let component: TaskIllustrationComponent;
  let fixture: ComponentFixture<TaskIllustrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskIllustrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskIllustrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
