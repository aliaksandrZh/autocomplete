import { Component, OnInit } from '@angular/core';
import { HttpClient }  from "@angular/common/http";
import {map, Observable, of, tap} from "rxjs";
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {AutoCompleteOption} from "./types";

export function matchedWithOptions(options: AutoCompleteOption[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    if (typeof control.value !== 'string') {
      return null
    }

    if (!control.value) {
      return null
    }

    if (!options.length) {
      return  { incorrect: true }
    }

    const selectedOption = options.find(opt => control.value === opt.displayText);

    if (selectedOption) {
      control.setValue(selectedOption)
      return null
    }

    return { incorrect: true };
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'reusable-autocomplete';


  fg = new FormGroup({
      user: new FormControl('', [Validators.required]),
      userAsync: new FormControl('', [Validators.required])
    });

  userAsyncValidator: ValidatorFn | undefined;

  public options: AutoCompleteOption[] = [];

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.getUsers();
  }

  getUsers(): void {
    this.http.get<any[]>(`https://jsonplaceholder.typicode.com/users`)
      .pipe(
        map(x => x.map(u => ({
          displayText: `${u.username}`,
          value: u.id,
        }))),
        tap(x => {
          this.fg.controls.user.addValidators(matchedWithOptions(x))
          this.options = x;
        })
      ).subscribe();

  }

  getUsersAsync = (v: string | null): Observable<AutoCompleteOption[]> => {
    return this.http.get<any[]>(`https://jsonplaceholder.typicode.com/users?username_like=${v}`)
      .pipe(
        map(x => x.map(u => ({
          displayText: `${u.username}`,
          value: u.id,
        }))),
        tap(x => {
          if (this.userAsyncValidator) {
            this.fg.controls.userAsync.removeValidators(this.userAsyncValidator);
          }
          this.userAsyncValidator = matchedWithOptions(x);
          this.fg.controls.userAsync.addValidators(this.userAsyncValidator);
        })
      )

  }

  onSubmit() {
    console.log('submit')
  }
}
