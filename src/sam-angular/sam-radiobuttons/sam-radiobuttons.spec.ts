import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// Load the implementations that should be tested
import { SamRadioButtonsComponent, SamAngularModule } from '../../sam-angular';

describe('The Sam Radio Buttons component', () => {
  let component: SamRadioButtonsComponent;
  let fixture: any;

  let options = [
    {value: 'dc', label: 'Washington DC'},
    {value: 'ma', label: 'Maryland'},
    {value: 'va', label: 'Virginia'},
  ];

  // provide our implementations or mocks to the dependency injector
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SamRadioButtonsComponent],
      imports: [SamAngularModule]
    });

    fixture = TestBed.createComponent(SamRadioButtonsComponent);
    component = fixture.componentInstance;
  });

  it('should display 3 checkboxes if 3 options are specified by the config', function () {
    component.config = { options: options };
    fixture.detectChanges();
    expect(fixture.nativeElement.getElementsByTagName('input').length).toBe(options.length);
  });

  it('should allow an initial value to be set by the model input', async(() => {
    component.config = {options: options};
    component.model = 'ma';
    fixture.detectChanges();
    let checkedElement = fixture.debugElement.query(By.css(':checked + label'));
    expect(checkedElement.nativeElement.innerHTML).toContain('Maryland');
    expect(checkedElement.nativeElement.innerHTML).not.toContain('DC');
  }));

  it('should deselect one radio button when another is clicked', function () {
    component.config = {options: options};
    component.model = 'ma';
    fixture.detectChanges();
    let label1 = fixture.debugElement.query(By.css(':checked + label')).nativeElement.innerHTML;
    component.model = 'dc';
    fixture.detectChanges();
    let label2 = fixture.debugElement.query(By.css(':checked + label')).nativeElement.innerHTML;
    expect(label1).not.toEqual(label2);
  });

  it('should show a hint message', function () {
    let hint = "Life pro tip: eat vegetables";
    component.config = {hint: hint, options: options};
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain(hint);
  });

  it('should show an error message', function () {
    let errorMessage = "Uh-oh, something went wrong";
    component.config = {errorMessage: errorMessage, options: options};
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain(errorMessage);
  });

  it('should show a label', function () {
    let labelText = "Pick from the following options";
    component.config = {label: labelText, options: options};
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain(labelText);
  });

});
