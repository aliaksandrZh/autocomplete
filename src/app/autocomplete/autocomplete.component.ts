import {Component, Input} from '@angular/core';
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn} from "@angular/forms";
import {debounceTime, distinctUntilChanged, filter, map, Observable, of, startWith, switchMap, tap} from "rxjs";
import {AutoCompleteOption} from "../types";

type AsyncOptions = (v: any) => Observable<AutoCompleteOption[]>


@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent {
  @Input() options: AutoCompleteOption[] = [];
  @Input() control: FormControl<AutoCompleteOption | string | null> = new FormControl<AutoCompleteOption | string>('');
  // @ts-ignore
  @Input() asyncOptions: AsyncOptions;

  filteredOptions$: Observable<AutoCompleteOption[]> | undefined;

  ngOnChanges() {
    if (this.control) {
      if (this.asyncOptions) {
        this.filteredOptions$ = this.control.valueChanges.pipe(
          startWith(''),
          filter(x => typeof x === "string"),
          debounceTime(1000),
          distinctUntilChanged(),
          switchMap(x => this.asyncOptions(x))
        )

      } else {
        this.filteredOptions$ = this.control.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || '')),
        );
      }
    } else {
      this.filteredOptions$ = of(this.options);
    }
  }

  private _filter(value: string | AutoCompleteOption): AutoCompleteOption[] {
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();

      return this.options.filter(option => option.displayText.toLowerCase().includes(filterValue));
    }

    return this.options;
  }

  displayFn(user: AutoCompleteOption): string {
    return user && user.displayText ? user.displayText : '';
  }
}
