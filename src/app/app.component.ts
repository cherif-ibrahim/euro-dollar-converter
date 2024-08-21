import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

const INITIAL_VALUE = 1.1;
const MIN_VARIATION = -0.05;
const MAX_VARIATION = 0.05;
const UPDATE_FREQUENCY = 3000;

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatTableModule,],
    providers: [],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    conversions: {reelExchangeRate:string, fixedExchangeRate:string, initialValue:string, convertedValue:string}[] = []
    dataSource = new MatTableDataSource(this.conversions);
    displayedColumns: string[] = ['reelExchangeRate', 'fixedExchangeRate', 'initialValue', 'convertedValue'];
    updateIntervalRef: any;

    reelExchangeRateEuroDollar = signal(1.1);
    euro1 = signal(0);
    dollar1 = computed(() => this.roundValue(this.euro1() * (this.isFixedRate() ? this.fixedExchangeRateEuroDollar() : this.reelExchangeRateEuroDollar())));
    history1 = effect(() => {
        if (this.dollar1() && this.euroToDollar()) {
            this.conversions.unshift({
                reelExchangeRate: `1 € = ${this.reelExchangeRateEuroDollar()} $`,
                fixedExchangeRate: `1 € = ${this.fixedExchangeRateEuroDollar()} $`,
                initialValue: `${this.euro1()} €`,
                convertedValue: `${this.dollar1()} $`,
            });
            this.dataSource = new MatTableDataSource(this.conversions.slice(0, 5));
        }
    });

    reelExchangeRateDollarEuro = computed(() => this.roundValue(1 / this.reelExchangeRateEuroDollar()));
    dollar2 = signal(0);
    euro2 = computed(() => this.roundValue(this.dollar2() * (this.isFixedRate() ? this.fixedExchangeRateDollarEuro() : this.reelExchangeRateDollarEuro())));
    history2 = effect(() => {
        if (this.euro2() && !this.euroToDollar()) {
            this.conversions.unshift({
                reelExchangeRate: `1 $ = ${this.reelExchangeRateDollarEuro()} €`,
                fixedExchangeRate: `1 $ = ${this.fixedExchangeRateDollarEuro()} €`,
                initialValue: `${this.dollar2()} $`,
                convertedValue: `${this.euro2()} €`,
            });
            this.dataSource = new MatTableDataSource(this.conversions.slice(0, 5));
        }
    })

    euroToDollar = signal(true);
    isFixedRate = signal(false);
    
    fixedExchangeRateEuroDollar = signal(1.1);
    fixedExchangeRateDollarEuro = signal(this.roundValue(1 / 1.1));

    ngOnInit() {
        this.updateExchangeRate();
    }

    ngOnDestroy() {
        clearInterval(this.updateIntervalRef);
    }
    
    switchCurrency() {
        this.euroToDollar.update(val => !val);
        if (this.euroToDollar()) {
            this.euro1.set(this.euro2());
        } else {
            this.dollar2.set(this.dollar1());
        }
    }

    updateExchangeRate() {
        this.updateIntervalRef = setInterval(() => {
            const randomValue = this.getRandomNumber(MIN_VARIATION, MAX_VARIATION);
            const reelExchangeRate = this.roundValue(INITIAL_VALUE + randomValue);
            this.reelExchangeRateEuroDollar.set(reelExchangeRate);
            const variation = this.euroToDollar() ? Math.abs(this.reelExchangeRateEuroDollar() - this.fixedExchangeRateEuroDollar()) : 
            Math.abs(this.reelExchangeRateDollarEuro() - this.fixedExchangeRateDollarEuro());
            if (variation > (2 / 100) && this.isFixedRate()) {
                this.isFixedRate.set(false);
            }
        }, UPDATE_FREQUENCY);
    }

    getRandomNumber(min: number, max: number): number {
        return this.roundValue(Math.random() * (max - min) + min);
    }

    roundValue(n: number) {
        return Math.round(n * 100) / 100;
    }

}
